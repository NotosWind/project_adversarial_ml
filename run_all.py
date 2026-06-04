"""Запуск всего пайплайна одной командой: обучение базовой модели + эксперимент.

Запуск (из активированного окружения или его интерпретатором):
    python run_all.py
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent


def run(script: str):
    print(f"\n{'=' * 70}\n>>> {script}\n{'=' * 70}")
    subprocess.run([sys.executable, str(ROOT / "scripts" / script)], check=True)


def main():
    run("train_baseline.py")     # модель -> models/baseline.pt
    run("run_experiment.py")     # 10 итераций атака<->защита, графики, ONNX
    print("\nВсё готово. Результаты: results/figures/, метрики: results/metrics.csv")


if __name__ == "__main__":
    main()
