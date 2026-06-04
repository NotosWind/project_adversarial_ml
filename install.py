r"""Кроссплатформенный установщик зависимостей в изолированное окружение.

Создаёт виртуальное окружение .venv и ставит туда всё из requirements.txt.
Работает одинаково на Windows / Linux / macOS, не требует прав администратора.

Запуск:
    python install.py

После установки:
    # Windows:   .\.venv\Scripts\python.exe run_all.py
    # Linux/mac: ./.venv/bin/python run_all.py
"""
import pathlib
import subprocess
import sys
import venv

ROOT = pathlib.Path(__file__).resolve().parent
VENV_DIR = ROOT / ".venv"


def venv_python(venv_dir: pathlib.Path) -> pathlib.Path:
    """Путь к интерпретатору python внутри окружения для текущей ОС."""
    if sys.platform == "win32":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def main():
    print(f"[1/3] Создаю виртуальное окружение: {VENV_DIR}")
    venv.create(VENV_DIR, with_pip=True)

    py = str(venv_python(VENV_DIR))
    print("[2/3] Обновляю pip")
    subprocess.run([py, "-m", "pip", "install", "--upgrade", "pip"], check=True)

    print("[3/3] Устанавливаю зависимости из requirements.txt")
    subprocess.run([py, "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")], check=True)

    run_py = ".\\.venv\\Scripts\\python.exe" if sys.platform == "win32" else "./.venv/bin/python"
    print("\nГотово! Запустите весь пайплайн одной командой:")
    print(f"    {run_py} run_all.py")
    print("\nЕсть GPU NVIDIA? Для ускорения поставьте CUDA-сборку torch внутрь окружения,")
    print("следуя https://pytorch.org/get-started/locally/ (иначе всё работает на CPU, просто медленнее).")


if __name__ == "__main__":
    main()
