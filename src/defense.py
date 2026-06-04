"""Модуль защиты: состязательное обучение (adversarial training, Madry et al., 2017).

Ключевая идея корректной реализации: для КАЖДОГО батча состязательные примеры
генерируются заново против ТЕКУЩИХ весов модели (а не один раз за эпоху по
фиксированной подвыборке). Иначе модель «запоминает» конкретные возмущения, но
остаётся уязвимой к свежей адаптивной атаке.
"""
import torch
import torch.nn.functional as F


def pgd_perturb(model, x, y, eps, alpha, steps):
    """Ручная PGD-атака (L∞) для генерации состязательных примеров при обучении.

    Используется внутри обучения (нужны градиенты по входу батча на устройстве).
    Для ОЦЕНКИ устойчивости в проекте применяется PGD из ART (см. attacker.py).
    """
    x_adv = (x + torch.empty_like(x).uniform_(-eps, eps)).clamp(0, 1)
    for _ in range(steps):
        x_adv.requires_grad_(True)
        loss = F.cross_entropy(model(x_adv), y)
        grad, = torch.autograd.grad(loss, x_adv)
        with torch.no_grad():
            x_adv = x_adv + alpha * grad.sign()
            x_adv = torch.min(torch.max(x_adv, x - eps), x + eps).clamp(0, 1)
        x_adv = x_adv.detach()
    return x_adv


def adversarial_train_epoch(model, optimizer, x_train_t, y_train_t, device,
                            eps=0.2, alpha=0.05, steps=7, batch_size=128):
    """Одна эпоха состязательного обучения.

    Для каждого батча: генерируем PGD-примеры против текущих весов и делаем шаг
    оптимизации на них. Тензоры x_train_t / y_train_t уже находятся на устройстве.
    Возвращает среднюю потерю за эпоху.
    """
    model.train()
    n = x_train_t.shape[0]
    perm = torch.randperm(n, device=device)
    total = 0.0
    for i in range(0, n, batch_size):
        b = perm[i:i + batch_size]
        xb, yb = x_train_t[b], y_train_t[b]
        x_adv = pgd_perturb(model, xb, yb, eps, alpha, steps)
        optimizer.zero_grad()
        loss = F.cross_entropy(model(x_adv), yb)
        loss.backward()
        optimizer.step()
        total += loss.item() * xb.shape[0]
    model.eval()
    return total / n
