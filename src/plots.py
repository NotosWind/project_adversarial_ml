"""Построение графиков и сеток изображений по результатам эксперимента."""
import matplotlib
matplotlib.use('Agg')                       # без графического дисплея
import matplotlib.pyplot as plt


def plot_accuracy_curves(rows, path):
    """Кривые точности (чистая / PGD до и после / FGSM) по итерациям."""
    it = [r['iteration'] for r in rows]
    plt.figure(figsize=(8, 5))
    plt.plot(it, [r['clean_acc'] for r in rows], 'o-', label='Чистый тест')
    plt.plot(it, [r['pgd_acc_after'] for r in rows], 's-', label='PGD после защиты')
    plt.plot(it, [r['pgd_acc_before'] for r in rows], '^-', label='PGD до защиты')
    plt.plot(it, [r['fgsm_acc_before'] for r in rows], 'd--', label='FGSM до защиты')
    plt.xlabel('Итерация'); plt.ylabel('Точность'); plt.ylim(0, 1.02)
    plt.title('Точность модели по итерациям (атака ↔ защита)')
    plt.grid(True, alpha=0.3); plt.legend()
    plt.tight_layout(); plt.savefig(path, dpi=130); plt.close()


def plot_attack_success(rows, path):
    """Столбчатая диаграмма успеха атаки PGD (до защиты) по итерациям."""
    it = [r['iteration'] for r in rows]
    plt.figure(figsize=(8, 5))
    plt.bar(it, [r['attack_success_before'] for r in rows], color='crimson', alpha=0.75)
    plt.xlabel('Итерация'); plt.ylabel('Доля успешных атак (PGD)')
    plt.title('Успех атаки PGD до защиты по итерациям')
    plt.ylim(0, 1.02); plt.grid(True, axis='y', alpha=0.3)
    plt.tight_layout(); plt.savefig(path, dpi=130); plt.close()


def plot_adv_grid(x_clean, x_adv, y_true, pred_base, pred_robust, path, n=6, eps=0.2):
    """Сетка: оригинал → состязательный пример (предсказания двух моделей)."""
    n = min(n, len(x_clean))
    fig, axes = plt.subplots(3, n, figsize=(1.7 * n, 5.6))
    rows_spec = [
        ('Оригинал', x_clean, y_true, None),
        ('PGD → базовая', x_adv, pred_base, y_true),
        ('PGD → устойчивая', x_adv, pred_robust, y_true),
    ]
    for r, (label, imgs, preds, truth) in enumerate(rows_spec):
        for j in range(n):
            ax = axes[r, j]
            ax.imshow(imgs[j].reshape(28, 28), cmap='gray', vmin=0, vmax=1)
            ax.set_xticks([]); ax.set_yticks([])
            if r == 0:
                ax.set_title(f"метка {preds[j]}", fontsize=9)
            else:
                ok = preds[j] == truth[j]
                ax.set_title(f"→ {preds[j]}", fontsize=9, color='green' if ok else 'red')
        axes[r, 0].set_ylabel(label, fontsize=10)
    fig.suptitle(f'Состязательные примеры (PGD, ε={eps}): базовая модель ошибается, устойчивая — нет',
                 fontsize=11)
    plt.tight_layout(); plt.savefig(path, dpi=130); plt.close()


def plot_epsilon_sweep(eps_list, acc_base, acc_robust, path):
    """Зависимость точности под PGD от силы атаки ε для двух моделей."""
    plt.figure(figsize=(8, 5))
    plt.plot(eps_list, acc_base, 'o-', label='Базовая модель')
    plt.plot(eps_list, acc_robust, 's-', label='Устойчивая модель (после защиты)')
    plt.xlabel('Сила атаки ε (PGD, L∞)'); plt.ylabel('Точность под атакой')
    plt.title('Устойчивость к PGD при разной силе атаки')
    plt.ylim(0, 1.02); plt.grid(True, alpha=0.3); plt.legend()
    plt.tight_layout(); plt.savefig(path, dpi=130); plt.close()
