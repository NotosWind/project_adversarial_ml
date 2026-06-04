"""Экспорт модели в ONNX и проверка совпадения выходов через onnxruntime."""
import numpy as np
import torch


def export_to_onnx(model, path, device):
    """Сохранить модель в формат ONNX (демонстрация переносимости)."""
    model.eval()
    dummy = torch.randn(1, 1, 28, 28, device=device)
    torch.onnx.export(
        model, dummy, path,
        input_names=['input'], output_names=['logits'],
        dynamic_axes={'input': {0: 'batch'}, 'logits': {0: 'batch'}},
        opset_version=13,
        dynamo=False,          # классический экспортёр: один самодостаточный .onnx, без warning'ов
    )
    return path


def verify_onnx(model, onnx_path, device, n=64):
    """Сравнить выходы PyTorch и ONNX Runtime; вернуть максимальное расхождение."""
    import onnxruntime as ort
    model.eval()
    x = torch.randn(n, 1, 28, 28, device=device)
    with torch.no_grad():
        torch_out = model(x).cpu().numpy()
    sess = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
    onnx_out = sess.run(None, {'input': x.cpu().numpy()})[0]
    return float(np.max(np.abs(torch_out - onnx_out)))
