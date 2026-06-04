"""CNN-классификатор для MNIST и утилиты сохранения/загрузки (.pt = pickle)."""
import torch
import torch.nn as nn


class MnistCNN(nn.Module):
    """Свёрточная сеть: 2 conv + pool + 2 fc. Базовая точность ~99% на MNIST."""

    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3),    # 28 -> 26
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, kernel_size=3),   # 26 -> 24
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),                    # 24 -> 12
            nn.Dropout(0.25),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 12 * 12, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(128, 10),                 # логиты
        )

    def forward(self, x):
        return self.classifier(self.features(x))


def save_model(model: nn.Module, path: str) -> None:
    """Сохранить веса модели в файл .pt (сериализация pickle)."""
    torch.save(model.state_dict(), path)


def load_model(path: str, device: torch.device) -> "MnistCNN":
    """Загрузить модель из файла .pt — это и есть 'модель на входе' для атакователя."""
    model = MnistCNN()
    model.load_state_dict(torch.load(path, map_location=device))
    model.to(device)
    model.eval()
    return model
