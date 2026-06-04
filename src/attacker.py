"""Модуль-«атакователь»: обёртка модели в ART и состязательные атаки FGSM / PGD.

Принимает обученную модель (загруженную из файла), оборачивает её в ART-классификатор
и применяет атаки из Adversarial Robustness Toolbox.
"""
import numpy as np
import torch
import torch.nn as nn
from art.estimators.classification import PyTorchClassifier
from art.attacks.evasion import FastGradientMethod, ProjectedGradientDescent


def make_art_classifier(model, device, lr=1e-3, clip=(0.0, 1.0)):
    """Обернуть PyTorch-модель в ART PyTorchClassifier."""
    loss = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    return PyTorchClassifier(
        model=model,
        loss=loss,
        optimizer=optimizer,
        input_shape=(1, 28, 28),
        nb_classes=10,
        clip_values=clip,
        device_type='gpu' if device.type == 'cuda' else 'cpu',
    )


def make_pgd(clf, eps=0.3, eps_step=0.01, max_iter=40):
    """PGD — Projected Gradient Descent (итеративная атака, L∞)."""
    return ProjectedGradientDescent(
        estimator=clf, norm=np.inf, eps=eps, eps_step=eps_step,
        max_iter=max_iter, num_random_init=1, targeted=False, verbose=False,
    )


def make_fgsm(clf, eps=0.3):
    """FGSM — Fast Gradient Sign Method (одношаговая атака, L∞)."""
    return FastGradientMethod(estimator=clf, norm=np.inf, eps=eps, targeted=False)


def accuracy(clf, x, y_onehot):
    """Доля верных предсказаний ART-классификатора на (x, y)."""
    preds = clf.predict(x)
    return float(np.mean(np.argmax(preds, axis=1) == np.argmax(y_onehot, axis=1)))


def evaluate_under_attack(clf, attack, x, y_onehot):
    """Сгенерировать состязательные примеры и вернуть (точность_под_атакой, x_adv)."""
    x_adv = attack.generate(x=x)
    return accuracy(clf, x_adv, y_onehot), x_adv
