"""Загрузка MNIST в формате NCHW float32 [0,1] с one-hot метками.

Основной источник — art.utils.load_mnist (скачивается и кэшируется автоматически,
без torchvision). Резервный источник — sklearn.datasets.fetch_openml.
"""
import numpy as np


def _to_nchw_onehot(x, y):
    """Привести изображения к NCHW [0,1] и метки к one-hot (N, 10)."""
    x = np.asarray(x, dtype=np.float32)
    if x.ndim == 4:                       # NHWC -> NCHW
        x = np.transpose(x, (0, 3, 1, 2))
    elif x.ndim == 3:                     # (N,H,W) -> (N,1,H,W)
        x = x[:, None, :, :]
    y = np.asarray(y)
    if y.ndim == 1:                       # индексы классов -> one-hot
        oh = np.zeros((y.shape[0], 10), dtype=np.float32)
        oh[np.arange(y.shape[0]), y.astype(int)] = 1.0
        y = oh
    return x, y.astype(np.float32)


def load_data():
    """Вернуть (x_train, y_train), (x_test, y_test), min, max.

    x: (N, 1, 28, 28) float32 в [0, 1]; y: (N, 10) one-hot.
    """
    try:
        from art.utils import load_mnist
        (x_train, y_train), (x_test, y_test), min_, max_ = load_mnist()
        x_train, y_train = _to_nchw_onehot(x_train, y_train)
        x_test, y_test = _to_nchw_onehot(x_test, y_test)
        return (x_train, y_train), (x_test, y_test), float(min_), float(max_)
    except Exception as e:  # резервный источник данных
        print(f"[data] art.utils.load_mnist не сработал ({e}); пробую sklearn fetch_openml...")
        from sklearn.datasets import fetch_openml
        mnist = fetch_openml('mnist_784', version=1, as_frame=False)
        x = (mnist.data.astype(np.float32) / 255.0).reshape(-1, 28, 28)
        y = mnist.target.astype(int)
        x_train, y_train = _to_nchw_onehot(x[:60000], y[:60000])
        x_test, y_test = _to_nchw_onehot(x[60000:], y[60000:])
        return (x_train, y_train), (x_test, y_test), 0.0, 1.0


def subset(x, y, n, seed=42):
    """Случайная подвыборка из n примеров (для быстрой оценки атак)."""
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(x), size=min(n, len(x)), replace=False)
    return x[idx], y[idx]
