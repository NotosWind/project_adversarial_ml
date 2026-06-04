"""Оркестратор итеративного цикла «атака ↔ защита» (10 итераций)."""
import csv

import numpy as np
import torch

from .model import save_model
from .attacker import (make_art_classifier, make_pgd, make_fgsm,
                       accuracy, evaluate_under_attack)
from .defense import adversarial_train_epoch
from .data import subset


def run_pipeline(model, x_train, y_train, x_test, y_test, device,
                 n_iters=10, eval_n=2000, train_subset=20000,
                 eps=0.2, pgd_eval_step=0.01, pgd_eval_iter=40,
                 pgd_train_steps=7, fgsm_eps=0.2,
                 models_dir='models', seed=42, log=print):
    """Прогнать n_iters итераций цикла; вернуть список метрик по итерациям.

    На каждой итерации:
      1) замер точности под атакой (PGD/FGSM) — это качество ДО защиты этой итерации;
      2) одна эпоха состязательного обучения (защита);
      3) повторный замер под PGD — качество ПОСЛЕ защиты (растёт).
    Оценка ведётся атакой PGD из ART при фиксированной конфигурации, поэтому
    метрики сопоставимы между итерациями.
    """
    x_eval, y_eval = subset(x_test, y_test, eval_n, seed=seed)

    # Обучающую подвыборку один раз кладём на устройство (ускоряет per-batch атаку).
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(x_train), size=min(train_subset, len(x_train)), replace=False)
    x_tr = torch.from_numpy(x_train[idx]).to(device)
    y_tr = torch.from_numpy(np.argmax(y_train[idx], axis=1)).long().to(device)

    clf = make_art_classifier(model, device)          # обёртка ART вокруг model
    pgd_e = make_pgd(clf, eps, pgd_eval_step, pgd_eval_iter)   # атака для ОЦЕНКИ
    fgsm_e = make_fgsm(clf, fgsm_eps)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)  # ПОСТОЯННЫЙ оптимизатор
    alpha = eps / 4

    rows = []
    for i in range(1, n_iters + 1):
        clean = accuracy(clf, x_test, y_test)
        pgd_before, _ = evaluate_under_attack(clf, pgd_e, x_eval, y_eval)
        fgsm_before, _ = evaluate_under_attack(clf, fgsm_e, x_eval, y_eval)

        adversarial_train_epoch(model, optimizer, x_tr, y_tr, device,
                                eps=eps, alpha=alpha, steps=pgd_train_steps)

        pgd_after, _ = evaluate_under_attack(clf, pgd_e, x_eval, y_eval)
        save_model(model, f"{models_dir}/robust_iter{i}.pt")

        rows.append(dict(
            iteration=i, clean_acc=round(clean, 4),
            fgsm_acc_before=round(fgsm_before, 4), pgd_acc_before=round(pgd_before, 4),
            pgd_acc_after=round(pgd_after, 4), attack_success_before=round(1 - pgd_before, 4),
        ))
        log(f"[итер {i:2d}] чистая={clean:.3f} | PGD до={pgd_before:.3f} "
            f"FGSM до={fgsm_before:.3f} | PGD после защиты={pgd_after:.3f} "
            f"| успех атаки={1 - pgd_before:.3f}")

    save_model(model, f"{models_dir}/robust_final.pt")
    return rows


def save_metrics(rows, path):
    """Записать метрики итераций в CSV."""
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
