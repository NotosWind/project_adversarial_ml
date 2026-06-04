// Генератор презентации (.pptx) через pptxgenjs.
// Запуск:  node docs/build_slides.js   (нужен NODE_PATH на глобальные модули)
const path = require("path");
const pptxgen = require("pptxgenjs");

const FIG = path.join(__dirname, "..", "results", "figures");
const fig = (f) => path.join(FIG, f);
const OUT = path.join(__dirname, "Презентация.pptx");

// ---- палитра ----
const NAVY = "0E1E40", NAVY2 = "1B2E57", LIGHT = "F4F6FB", WHITE = "FFFFFF";
const INK = "13233F", MUTED = "5C6A85", MUTEDD = "A7B6D6";
const RED = "E4572E", GREEN = "1FA971", GOLD = "E6A817";
const HFONT = "Trebuchet MS", BFONT = "Calibri";

const pres = new pptxgen();
pres.defineLayout({ name: "W", width: 13.33, height: 7.5 });
pres.layout = "W";
pres.author = "Проектная деятельность";
pres.title = "Итеративный состязательный атакователь ML-модели";

const W = 13.33, H = 7.5, M = 0.6;
const sh = () => ({ type: "outer", color: "0A1430", blur: 9, offset: 3, angle: 90, opacity: 0.18 });

// ---- помощники ----
function header(slide, titleText, accent = RED, idx = null) {
  slide.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.5, w: 0.16, h: 0.62, fill: { color: accent } });
  slide.addText(titleText, { x: M + 0.32, y: 0.42, w: W - 2 * M - 0.4, h: 0.78,
    fontFace: HFONT, fontSize: 30, bold: true, color: INK, valign: "middle", margin: 0 });
  if (idx !== null) {
    slide.addText(String(idx), { x: W - M - 0.6, y: H - 0.55, w: 0.5, h: 0.3,
      fontFace: BFONT, fontSize: 11, color: MUTED, align: "right" });
    slide.addText("Состязательный атакователь ML-модели", { x: M, y: H - 0.55, w: 7, h: 0.3,
      fontFace: BFONT, fontSize: 10, color: MUTED, align: "left" });
  }
}
function card(slide, x, y, w, h, fill = WHITE) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill },
    line: { color: "E2E8F4", width: 1 }, rectRadius: 0.08, shadow: sh() });
}
function figure(slide, file, x, y, h, aspect, caption) {
  const w = h * aspect;
  slide.addShape(pres.shapes.RECTANGLE, { x: x - 0.07, y: y - 0.07, w: w + 0.14, h: h + 0.14,
    fill: { color: WHITE }, line: { color: "D8E0EE", width: 1 }, shadow: sh() });
  slide.addImage({ path: fig(file), x, y, w, h });
  if (caption) slide.addText(caption, { x, y: y + h + 0.05, w, h: 0.3,
    fontFace: BFONT, fontSize: 11, italic: true, color: MUTED, align: "center" });
  return w;
}
function stat(slide, x, y, w, value, label, color) {
  slide.addText(value, { x, y, w, h: 0.9, fontFace: HFONT, fontSize: 48, bold: true,
    color, align: "left", margin: 0 });
  slide.addText(label, { x, y: y + 0.92, w, h: 0.5, fontFace: BFONT, fontSize: 13,
    color: MUTED, align: "left", margin: 0 });
}

// =================== Слайд 1 — Титул ===================
let s = pres.addSlide();
s.background = { color: NAVY };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: RED } });
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.18, w: W, h: 0.06, fill: { color: GREEN } });
s.addText("Итеративный состязательный атакователь\nML-модели", { x: M, y: 1.7, w: W - 2 * M, h: 1.8,
  fontFace: HFONT, fontSize: 40, bold: true, color: WHITE, lineSpacingMultiple: 1.05 });
s.addText("Защита через состязательное обучение (adversarial training)", { x: M, y: 3.5, w: W - 2 * M, h: 0.6,
  fontFace: BFONT, fontSize: 20, color: MUTEDD });
// мотив: два квадрата — атака/защита
s.addShape(pres.shapes.RECTANGLE, { x: M, y: 4.45, w: 0.5, h: 0.5, fill: { color: RED }, shadow: sh() });
s.addShape(pres.shapes.RECTANGLE, { x: M + 0.62, y: 4.45, w: 0.5, h: 0.5, fill: { color: GREEN }, shadow: sh() });
s.addText("атака  ↔  защита", { x: M + 1.25, y: 4.45, w: 6, h: 0.5, fontFace: BFONT, fontSize: 16,
  color: WHITE, valign: "middle", margin: 0 });
s.addText([
  { text: "Проектная деятельность · Прикладная математика и информатика · 2026", options: { breakLine: true, fontSize: 14, color: MUTEDD } },
  { text: "Выполнил: [ФИО студента]", options: { fontSize: 14, color: WHITE } },
], { x: M, y: 6.2, w: W - 2 * M, h: 0.8, fontFace: BFONT });

// =================== Слайд 2 — Проблема ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Проблема: состязательные примеры", RED, 2);
s.addText("Глубокие нейросети уязвимы: крошечное, незаметное глазу возмущение входа заставляет модель ошибаться с высокой уверенностью.",
  { x: M, y: 1.45, w: W - 2 * M, h: 0.7, fontFace: BFONT, fontSize: 16, color: INK });
const probs = [
  ["Незаметно", "Возмущение ‖δ‖∞ ≤ ε визуально неотличимо от оригинала.", RED],
  ["Опасно", "Угроза для распознавания знаков, биометрии, медицины.", GOLD],
  ["Универсально", "Уязвимы практически все глубокие модели.", NAVY2],
];
probs.forEach((c, i) => {
  const x = M + i * 4.06, w = 3.8, y = 2.5, h = 2.7;
  card(s, x, y, w, h);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.14, h, fill: { color: c[2] } });
  s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: y + 0.35, w: 0.62, h: 0.62, fill: { color: c[2] } });
  s.addText(String(i + 1), { x: x + 0.35, y: y + 0.35, w: 0.62, h: 0.62, fontFace: HFONT, fontSize: 22,
    bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText(c[0], { x: x + 0.35, y: y + 1.15, w: w - 0.6, h: 0.5, fontFace: HFONT, fontSize: 20, bold: true, color: INK, margin: 0 });
  s.addText(c[1], { x: x + 0.35, y: y + 1.65, w: w - 0.7, h: 0.9, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
});

// =================== Слайд 3 — Цель и задачи ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Цель и задачи", NAVY2, 3);
card(s, M, 1.5, 4.7, 4.4, NAVY);
s.addText("Цель", { x: M + 0.35, y: 1.85, w: 4, h: 0.5, fontFace: HFONT, fontSize: 22, bold: true, color: WHITE, margin: 0 });
s.addText("Разработать итеративный «атакователь» ML-модели и показать эффективность состязательного обучения как защиты за 10 итераций цикла «атака — защита».",
  { x: M + 0.35, y: 2.5, w: 4.05, h: 3.0, fontFace: BFONT, fontSize: 16, color: "E8EEFB", lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
const tasks = [
  "обучить базовую CNN на MNIST;",
  "реализовать атакователь на ART (FGSM, PGD);",
  "реализовать защиту — состязательное обучение;",
  "оркестрировать цикл на 10 итераций с метриками;",
  "визуализировать результаты;",
  "экспортировать устойчивую модель в ONNX.",
];
s.addText("Задачи", { x: 5.7, y: 1.6, w: 6, h: 0.5, fontFace: HFONT, fontSize: 22, bold: true, color: INK });
s.addText(tasks.map((t, i) => ({ text: t, options: { bullet: { type: "number" }, breakLine: true, paraSpaceAfter: 8 } })),
  { x: 5.8, y: 2.25, w: W - 5.8 - M, h: 4.4, fontFace: BFONT, fontSize: 16, color: INK });

// =================== Слайд 4 — Состязательные примеры ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Что такое состязательный пример", RED, 4);
s.addText([
  { text: "Состязательный пример", options: { bold: true } },
  { text: " — вход x' = x + δ, визуально неотличимый от исходного (‖δ‖∞ ≤ ε), но классифицируемый моделью неверно." },
], { x: M, y: 1.5, w: W - 2 * M, h: 1.1, fontFace: BFONT, fontSize: 18, color: INK, align: "center", lineSpacingMultiple: 1.15 });
// центрированная схема x + δ = x'
const bw4 = 2.2, bh4 = 1.9, by4 = 3.3, gap4 = 0.7;
const x04 = (W - (3 * bw4 + 2 * gap4)) / 2;
function box4(x, label, sub, col) {
  card(s, x, by4, bw4, bh4);
  s.addText(label, { x, y: by4 + 0.2, w: bw4, h: 1.0, fontFace: HFONT, fontSize: 46, bold: true, color: col, align: "center", valign: "middle", margin: 0 });
  s.addText(sub, { x, y: by4 + 1.32, w: bw4, h: 0.4, fontFace: BFONT, fontSize: 13, color: MUTED, align: "center", margin: 0 });
}
function op4(x, ch) {
  s.addText(ch, { x, y: by4, w: gap4, h: bh4, fontFace: HFONT, fontSize: 40, bold: true, color: MUTED, align: "center", valign: "middle" });
}
box4(x04, "x", "оригинал", INK);
op4(x04 + bw4, "+");
box4(x04 + bw4 + gap4, "δ", "возмущение (шум)", RED);
op4(x04 + 2 * bw4 + gap4, "=");
box4(x04 + 2 * bw4 + 2 * gap4, "x′", "обман модели", RED);
s.addText("Идея (Goodfellow, 2014): сдвиг входа на ε вдоль знака градиента ∇ₓ J(θ, x, y).",
  { x: M, y: 5.7, w: W - 2 * M, h: 0.6, fontFace: BFONT, fontSize: 15, italic: true, color: MUTED, align: "center" });

// =================== Слайд 5 — Атаки FGSM и PGD ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Атаки из ART: FGSM и PGD", RED, 5);
function attackCard(x, name, formula, pts, strong) {
  const w = 5.65, y = 1.6, h = 4.9;
  card(s, x, y, w, h);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.7, fill: { color: strong ? RED : NAVY2 } });
  s.addText(name, { x: x + 0.3, y, w: w - 0.6, h: 0.7, fontFace: HFONT, fontSize: 20, bold: true, color: WHITE, valign: "middle", margin: 0 });
  s.addText(formula, { x: x + 0.3, y: y + 0.95, w: w - 0.6, h: 0.6, fontFace: "Consolas", fontSize: 15, color: INK, margin: 0 });
  s.addText(pts.map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } })),
    { x: x + 0.3, y: y + 1.7, w: w - 0.6, h: 3.0, fontFace: BFONT, fontSize: 15, color: INK });
}
attackCard(M, "FGSM — одношаговая", "x' = x + ε·sign(∇ₓ J)", [
  "один шаг по градиенту;", "быстрая, но относительно слабая;", "база для понимания атак.",
], false);
attackCard(M + 5.95, "PGD — итеративная", "xᵗ⁺¹ = Proj(xᵗ + α·sign(∇ₓ J))", [
  "много шагов с проекцией на ε-окрестность;", "«сильнейшая атака первого порядка»;", "стандарт для оценки устойчивости.",
], true);

// =================== Слайд 6 — Защита ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Защита: состязательное обучение", GREEN, 6);
s.addText([
  { text: "Состязательное обучение", options: { bold: true } },
  { text: " (Madry, 2017) — дообучение модели на состязательных примерах. Минимаксная задача:" },
], { x: M, y: 1.5, w: W - 2 * M, h: 0.8, fontFace: BFONT, fontSize: 17, color: INK });
card(s, M, 2.45, W - 2 * M, 1.1, NAVY);
s.addText("min_θ  E(x,y) [ max(‖δ‖∞ ≤ ε)  J(θ, x + δ, y) ]", { x: M, y: 2.45, w: W - 2 * M, h: 1.1,
  fontFace: "Consolas", fontSize: 22, bold: true, color: WHITE, align: "center", valign: "middle" });
const defs = [
  ["Внутренний max", "приближается атакой PGD — ищем худшее возмущение.", RED],
  ["Внешний min", "обычный шаг оптимизации — учим модель не поддаваться.", GREEN],
  ["Ключевая деталь", "примеры генерируются заново для каждого батча (см. слайд 12).", GOLD],
];
defs.forEach((c, i) => {
  const x = M + i * 4.06, w = 3.8, y = 4.0, h = 2.5;
  card(s, x, y, w, h);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.12, fill: { color: c[2] } });
  s.addText(c[0], { x: x + 0.3, y: y + 0.3, w: w - 0.6, h: 0.5, fontFace: HFONT, fontSize: 18, bold: true, color: INK, margin: 0 });
  s.addText(c[1], { x: x + 0.3, y: y + 0.85, w: w - 0.6, h: 1.4, fontFace: BFONT, fontSize: 14, color: MUTED, margin: 0 });
});

// =================== Слайд 7 — Данные и модель ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Данные и модель", NAVY2, 7);
card(s, M, 1.6, 5.6, 4.9);
s.addText("Данные — MNIST", { x: M + 0.35, y: 1.85, w: 5, h: 0.5, fontFace: HFONT, fontSize: 20, bold: true, color: INK, margin: 0 });
s.addText([
  "70 000 изображений рукописных цифр 28×28;",
  "градации серого, значения в [0, 1];",
  "60 000 — обучение, 10 000 — тест;",
  "загрузка средствами ART (load_mnist).",
].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 8 } })),
  { x: M + 0.35, y: 2.45, w: 5.0, h: 3.8, fontFace: BFONT, fontSize: 15, color: INK });
card(s, 6.5, 1.6, W - 6.5 - M, 4.9);
s.addText("Модель — CNN", { x: 6.85, y: 1.85, w: 5, h: 0.5, fontFace: HFONT, fontSize: 20, bold: true, color: INK, margin: 0 });
const arch = ["Вход 1×28×28", "Conv 3×3, 32 + ReLU", "Conv 3×3, 64 + ReLU", "MaxPool 2×2 + Dropout", "FC 128 + ReLU + Dropout", "FC 10 (логиты)"];
arch.forEach((a, i) => {
  const y = 2.5 + i * 0.62;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.85, y, w: 4.0, h: 0.5, fill: { color: i === 5 ? GREEN : NAVY2 }, rectRadius: 0.05 });
  s.addText(a, { x: 6.95, y, w: 3.8, h: 0.5, fontFace: BFONT, fontSize: 13, color: WHITE, valign: "middle", margin: 0 });
});
s.addText("Базовая точность ≈ 98.8 %", { x: 6.85, y: 6.2, w: 4.5, h: 0.3, fontFace: BFONT, fontSize: 13, italic: true, color: MUTED, margin: 0 });

// =================== Слайд 8 — Методика (схема цикла) ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Итеративный цикл «атака ↔ защита»", GOLD, 8);
function flowBox(x, w, title, sub, col) {
  const y = 2.2, h = 1.9;
  card(s, x, y, w, h);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.12, fill: { color: col } });
  s.addText(title, { x: x + 0.2, y: y + 0.35, w: w - 0.4, h: 0.9, fontFace: HFONT, fontSize: 17, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
  s.addText(sub, { x: x + 0.2, y: y + 1.15, w: w - 0.4, h: 0.65, fontFace: BFONT, fontSize: 13, color: MUTED, align: "center", margin: 0 });
}
flowBox(M, 2.7, "Модель (.pt)", "приходит как файл", NAVY2);
s.addText("→", { x: M + 2.7, y: 2.2, w: 0.75, h: 1.9, fontFace: HFONT, fontSize: 34, bold: true, color: MUTED, align: "center", valign: "middle" });
flowBox(M + 3.45, 3.0, "Атака PGD (ART)", "точность ↓ (до 2 %)", RED);
s.addText("→", { x: M + 6.45, y: 2.2, w: 0.75, h: 1.9, fontFace: HFONT, fontSize: 34, bold: true, color: MUTED, align: "center", valign: "middle" });
flowBox(M + 7.2, 3.35, "Состязательное обучение", "точность ↑ (до 92 %)", GREEN);
// петля
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.7, w: W - 2 * M, h: 1.2, fill: { color: NAVY }, rectRadius: 0.1, shadow: sh() });
s.addText([
  { text: "↻  Повторяется 10 итераций. ", options: { bold: true, color: GOLD } },
  { text: "Оценка — фиксированной атакой PGD. Устойчивость растёт ", options: { color: WHITE } },
  { text: "2 % → 92 %", options: { bold: true, color: GREEN } },
  { text: ".", options: { color: WHITE } },
], { x: M + 0.4, y: 4.7, w: W - 2 * M - 0.8, h: 1.2, fontFace: BFONT, fontSize: 16, valign: "middle" });
s.addText("Форматы модели: PyTorch .pt (pickle) на входе · экспорт устойчивой модели в ONNX.",
  { x: M, y: 6.1, w: W - 2 * M, h: 0.5, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED });

// =================== Слайд 9 — Результаты: цифры ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Результаты: динамика по итерациям", GREEN, 9);
stat(s, M, 1.7, 4.5, "98.8 %", "точность на чистом тесте (стабильна)", NAVY2);
stat(s, M, 3.3, 4.5, "2.0 %", "точность под PGD у базовой модели", RED);
stat(s, M, 4.9, 4.5, "92.3 %", "точность под PGD после 10 итераций защиты", GREEN);
figure(s, "accuracy_curves.png", 5.7, 1.75, 4.1, 1.6, "Точность по итерациям: атака ↔ защита");

// =================== Слайд 10 — Результаты: примеры ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Результаты: одно возмущение — два исхода", RED, 10);
s.addText([
  { text: "Одно и то же PGD-возмущение обманывает базовую модель (красное), но не устойчивую (зелёное).", options: {} },
], { x: M, y: 1.35, w: W - 2 * M, h: 0.5, fontFace: BFONT, fontSize: 16, color: INK });
figure(s, "adv_examples_grid.png", 2.16, 1.95, 4.95, 1.82, null);

// =================== Слайд 11 — Результаты: устойчивость и успех ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Результаты: устойчивость и успех атаки", GREEN, 11);
figure(s, "epsilon_sweep.png", 0.8, 1.9, 3.4, 1.6, "Устойчивость от силы атаки ε");
figure(s, "attack_success.png", 7.0, 1.9, 3.4, 1.6, "Успех атаки PGD по итерациям");
s.addText([
  { text: "Устойчивая модель превосходит базовую при всех ε; успех атаки PGD упал с ", options: { color: INK } },
  { text: "98 % до 8 %", options: { bold: true, color: GREEN } },
  { text: ".", options: { color: INK } },
], { x: M, y: 6.3, w: W - 2 * M, h: 0.5, fontFace: BFONT, fontSize: 15, align: "center" });

// =================== Слайд 12 — Важная находка ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Важная находка: адаптивность атаки", GOLD, 12);
s.addText("Качество защиты определяется не фактом обучения «на adversarial-данных», а адаптивностью атаки при обучении.",
  { x: M, y: 1.45, w: W - 2 * M, h: 0.7, fontFace: BFONT, fontSize: 16, color: INK });
card(s, M, 2.4, 5.65, 3.9);
s.addShape(pres.shapes.RECTANGLE, { x: M, y: 2.4, w: 5.65, h: 0.7, fill: { color: RED } });
s.addText("✗  Генерация 1× за итерацию", { x: M + 0.3, y: 2.4, w: 5.1, h: 0.7, fontFace: HFONT, fontSize: 18, bold: true, color: WHITE, valign: "middle", margin: 0 });
s.addText([
  "атака строится по фиксированной подвыборке;",
  "модель «запоминает» возмущения;",
  "робастность не растёт (≈ 1–12 %).",
].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } })),
  { x: M + 0.3, y: 3.3, w: 5.1, h: 2.8, fontFace: BFONT, fontSize: 15, color: INK });
card(s, 6.85, 2.4, W - 6.85 - M, 3.9);
s.addShape(pres.shapes.RECTANGLE, { x: 6.85, y: 2.4, w: W - 6.85 - M, h: 0.7, fill: { color: GREEN } });
s.addText("✓  Генерация per-batch", { x: 7.15, y: 2.4, w: 5.0, h: 0.7, fontFace: HFONT, fontSize: 18, bold: true, color: WHITE, valign: "middle", margin: 0 });
s.addText([
  "атака строится заново для каждого батча;",
  "против текущих весов модели;",
  "робастность растёт: 2 % → 80 % → 92 %.",
].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 10 } })),
  { x: 7.15, y: 3.3, w: 5.0, h: 2.8, fontFace: BFONT, fontSize: 15, color: INK });

// =================== Слайд 13 — Выводы ===================
s = pres.addSlide(); s.background = { color: LIGHT };
header(s, "Выводы", NAVY2, 13);
s.addText([
  "атака PGD снижает точность базовой модели с 98.8 % до 2.0 % (успех 98 %);",
  "состязательное обучение за 10 итераций поднимает устойчивость к PGD до 92.3 %;",
  "точность на чистых данных при этом сохраняется (~98.7 %);",
  "устойчивая модель превосходит базовую при всех значениях ε;",
  "итоговая модель экспортирована в ONNX (расхождение с PyTorch ~10⁻⁵);",
  "ключ к работающей защите — адаптивная (per-batch) генерация примеров.",
].map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 12 } })),
  { x: M + 0.1, y: 1.7, w: W - 2 * M - 0.2, h: 5.0, fontFace: BFONT, fontSize: 18, color: INK });

// =================== Слайд 14 — Спасибо ===================
s = pres.addSlide(); s.background = { color: NAVY };
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.24, w: W, h: 0.06, fill: { color: GREEN } });
s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - 0.18, w: W, h: 0.18, fill: { color: RED } });
s.addText("Спасибо за внимание!", { x: M, y: 2.6, w: W - 2 * M, h: 1.0, fontFace: HFONT, fontSize: 44, bold: true, color: WHITE });
s.addText("Вопросы?", { x: M, y: 3.7, w: W - 2 * M, h: 0.7, fontFace: HFONT, fontSize: 24, color: GOLD });
s.addText("Итеративный состязательный атакователь ML-модели · ART · adversarial training",
  { x: M, y: 6.2, w: W - 2 * M, h: 0.5, fontFace: BFONT, fontSize: 14, color: MUTEDD });

pres.writeFile({ fileName: OUT }).then((f) => console.log("OK:", OUT));
