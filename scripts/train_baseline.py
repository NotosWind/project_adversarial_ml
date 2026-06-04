"""Обучение базовой CNN на MNIST и сохранение в models/baseline.pt.

Это «модель на входе» для атакователя. Запуск:  python scripts/train_baseline.py
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader

from src.data import load_data
from src.model import MnistCNN, save_model
from src.attacker import make_art_classifier, accuracy

SEED = 42
EPOCHS = 3
BATCH = 128
LR = 1e-3


def main():
    np.random.seed(SEED)
    torch.manual_seed(SEED)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Устройство: {device}")

    (x_train, y_train), (x_test, y_test), _, _ = load_data()
    print(f"Train: {x_train.shape}, Test: {x_test.shape}")

    y_idx = np.argmax(y_train, axis=1)
    ds = TensorDataset(torch.from_numpy(x_train), torch.from_numpy(y_idx).long())
    dl = DataLoader(ds, batch_size=BATCH, shuffle=True)

    model = MnistCNN().to(device)
    opt = torch.optim.Adam(model.parameters(), lr=LR)
    lossf = nn.CrossEntropyLoss()

    model.train()
    for ep in range(1, EPOCHS + 1):
        running = 0.0
        for xb, yb in dl:
            xb, yb = xb.to(device), yb.to(device)
            opt.zero_grad()
            loss = lossf(model(xb), yb)
            loss.backward()
            opt.step()
            running += loss.item() * xb.size(0)
        print(f"Эпоха {ep}/{EPOCHS}: средняя потеря = {running / len(ds):.4f}")

    model.eval()
    (ROOT / 'models').mkdir(exist_ok=True)
    path = ROOT / 'models' / 'baseline.pt'
    save_model(model, str(path))

    clf = make_art_classifier(model, device)
    acc = accuracy(clf, x_test, y_test)
    print(f"Точность базовой модели на чистом тесте: {acc:.4f}")
    print(f"Модель сохранена: {path}")


if __name__ == '__main__':
    main()
