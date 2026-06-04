"""Полный эксперимент: модель из файла → 10 итераций атака↔защита →
графики → эскалация ε → экспорт в ONNX.

Запуск (после train_baseline.py):  python scripts/run_experiment.py
"""
import csv
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import numpy as np
import torch

from src.data import load_data, subset
from src.model import load_model
from src.attacker import make_art_classifier, make_pgd, evaluate_under_attack
from src.pipeline import run_pipeline, save_metrics
from src.plots import (plot_accuracy_curves, plot_attack_success,
                       plot_adv_grid, plot_epsilon_sweep)
from src.export_onnx import export_to_onnx, verify_onnx

SEED = 42
N_ITERS = 10
EVAL_N = 2000
TRAIN_SUBSET = 20000
EPS = 0.2                      # сила атаки в основном цикле (L∞)
EPS_SWEEP = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]


def main():
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Устройство: {device}\n")

    models_dir = ROOT / 'models'
    results_dir = ROOT / 'results'
    figures_dir = results_dir / 'figures'
    for d in (models_dir, results_dir, figures_dir):
        d.mkdir(parents=True, exist_ok=True)

    (x_train, y_train), (x_test, y_test), _, _ = load_data()

    # «Модель приходит на вход как файл» -> загружаем базовую модель из .pt (pickle)
    model = load_model(str(models_dir / 'baseline.pt'), device)
    print("Базовая модель загружена из models/baseline.pt\n")

    # --- Итеративный цикл атака <-> защита ---
    print(f"=== Итеративный цикл ({N_ITERS} итераций, ε={EPS}) ===")
    rows = run_pipeline(model, x_train, y_train, x_test, y_test, device,
                        n_iters=N_ITERS, eval_n=EVAL_N, train_subset=TRAIN_SUBSET,
                        eps=EPS, fgsm_eps=EPS, models_dir=str(models_dir), seed=SEED)
    save_metrics(rows, str(results_dir / 'metrics.csv'))
    print(f"\nМетрики сохранены: {results_dir / 'metrics.csv'}")

    # --- Графики по итерациям ---
    plot_accuracy_curves(rows, str(figures_dir / 'accuracy_curves.png'))
    plot_attack_success(rows, str(figures_dir / 'attack_success.png'))

    # --- Сетка примеров: оригинал vs adversarial (базовая vs устойчивая модель) ---
    base = load_model(str(models_dir / 'baseline.pt'), device)
    robust = load_model(str(models_dir / 'robust_final.pt'), device)
    clf_base = make_art_classifier(base, device)
    clf_robust = make_art_classifier(robust, device)
    x_demo, y_demo = subset(x_test, y_test, 6, seed=7)
    x_adv_demo = make_pgd(clf_base, eps=EPS, eps_step=0.01, max_iter=40).generate(x=x_demo)
    pred_base = np.argmax(clf_base.predict(x_adv_demo), axis=1)
    pred_robust = np.argmax(clf_robust.predict(x_adv_demo), axis=1)
    y_true = np.argmax(y_demo, axis=1)
    plot_adv_grid(x_demo, x_adv_demo, y_true, pred_base, pred_robust,
                  str(figures_dir / 'adv_examples_grid.png'), eps=EPS)

    # --- Дополнительный эксперимент: эскалация ε ---
    print("\n=== Эскалация ε (устойчивость от силы атаки) ===")
    x_eval, y_eval = subset(x_test, y_test, EVAL_N, seed=SEED)
    acc_base, acc_robust = [], []
    for eps in EPS_SWEEP:
        a_b, _ = evaluate_under_attack(clf_base, make_pgd(clf_base, eps, 0.01, 40), x_eval, y_eval)
        a_r, _ = evaluate_under_attack(clf_robust, make_pgd(clf_robust, eps, 0.01, 40), x_eval, y_eval)
        acc_base.append(a_b)
        acc_robust.append(a_r)
        print(f"ε={eps:.2f}: базовая={a_b:.3f} | устойчивая={a_r:.3f}")
    with open(results_dir / 'epsilon_sweep.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['eps', 'acc_base', 'acc_robust'])
        for e, ab, ar in zip(EPS_SWEEP, acc_base, acc_robust):
            w.writerow([e, round(ab, 4), round(ar, 4)])
    plot_epsilon_sweep(EPS_SWEEP, acc_base, acc_robust, str(figures_dir / 'epsilon_sweep.png'))

    # --- Экспорт устойчивой модели в ONNX ---
    onnx_path = models_dir / 'robust_final.onnx'
    export_to_onnx(robust, str(onnx_path), device)
    diff = verify_onnx(robust, str(onnx_path), device)
    print(f"\nONNX экспорт: {onnx_path}\nМакс. расхождение PyTorch vs ONNX Runtime: {diff:.2e}")

    print("\nГотово. Графики — в results/figures/, метрики — в results/, модели — в models/.")


if __name__ == '__main__':
    main()
