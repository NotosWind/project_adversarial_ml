// Генератор пояснительной записки (.docx) через docx-js.
// Запуск:  node docs/build_report.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Footer, AlignmentType, LevelFormat, TableOfContents, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
} = require("docx");

const FIG = path.join(__dirname, "..", "results", "figures");
const OUT = path.join(__dirname, "Пояснительная_записка.docx");

// ---------- помощники ----------
const TNR = "Times New Roman";

function p(content) {
  const children = typeof content === "string" ? [new TextRun(content)] : content;
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
    indent: { firstLine: 709 },
    children,
  });
}
function run(text, opts = {}) { return new TextRun({ text, ...opts }); }
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 160 },
    children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160, after: 120 },
    children: [new TextRun(text)] });
}
function center(text, opts = {}) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 360, after: opts.after ?? 0 },
    children: [new TextRun({ text, ...opts })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "b", level: 0 }, alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 }, children: [new TextRun(text)] });
}
function img(file, w, h, caption) {
  const out = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 },
    children: [new ImageRun({ type: "png", data: fs.readFileSync(path.join(FIG, file)),
      transformation: { width: w, height: h },
      altText: { title: caption, description: caption, name: file } })] })];
  if (caption) out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: caption, italics: true, size: 24 })] }));
  return out;
}
function code(lines) {
  return lines.map((l) => new Paragraph({ spacing: { line: 240 },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
    children: [new TextRun({ text: l.length ? l : " ", font: "Courier New", size: 18 })] }));
}
function table(headers, rows, colWidths) {
  const border = { style: BorderStyle.SINGLE, size: 2, color: "888888" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const total = colWidths.reduce((a, b) => a + b, 0);
  const cell = (text, w, o = {}) => new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: o.head ? { fill: "DCE6F1", type: ShadingType.CLEAR } : { fill: "FFFFFF", type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 80, right: 80 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: o.left ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { line: 240 }, children: [new TextRun({ text, bold: !!o.head, size: 22 })] })],
  });
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((hh, i) => cell(hh, colWidths[i], { head: true })) }),
      ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(String(c), colWidths[i], { left: i === 0 })) })),
    ] });
}

// ---------- данные результатов ----------
const iterRows = [
  ["1", "98.8", "48.9", "2.0", "80.5", "98.0"],
  ["2", "98.5", "88.1", "80.5", "85.8", "19.6"],
  ["3", "98.5", "91.1", "85.9", "87.2", "14.2"],
  ["4", "98.4", "92.3", "87.2", "89.4", "12.9"],
  ["5", "98.7", "93.4", "89.2", "89.4", "10.9"],
  ["6", "98.7", "93.4", "89.4", "90.5", "10.6"],
  ["7", "98.8", "93.5", "90.3", "90.8", "9.8"],
  ["8", "98.7", "94.7", "90.7", "91.6", "9.4"],
  ["9", "98.7", "95.3", "91.5", "91.8", "8.5"],
  ["10", "98.7", "95.0", "91.7", "92.3", "8.4"],
];
const epsRows = [
  ["0.05", "96.4", "98.5"],
  ["0.10", "79.9", "97.5"],
  ["0.15", "26.6", "95.2"],
  ["0.20", "2.2", "92.4"],
  ["0.25", "0.7", "82.9"],
  ["0.30", "0.7", "42.2"],
];

// ---------- титульный лист ----------
const title = [
  center("МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ", { bold: true, after: 60 }),
  center("РОССИЙСКОЙ ФЕДЕРАЦИИ", { bold: true, after: 120 }),
  center("[Наименование образовательной организации]", { after: 60 }),
  center("[Факультет] / [Кафедра]", { after: 1800 }),
  center("ОТЧЁТ", { bold: true, size: 36, after: 80 }),
  center("по дисциплине «Проектная деятельность»", { size: 28, after: 240 }),
  center("Тема: «Итеративный состязательный атакователь ML-модели", { bold: true, size: 28, after: 40 }),
  center("с защитой через состязательное обучение»", { bold: true, size: 28, after: 1400 }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 40 },
    children: [new TextRun("Выполнил: студент 3 курса")] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 40 },
    children: [new TextRun("направление «Прикладная математика и информатика»")] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 120 },
    children: [new TextRun("[ФИО студента] ___________")] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 1600 },
    children: [new TextRun("Проверил: [ФИО руководителя] ___________")] }),
  center("[Город], 2026", {}),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---------- оглавление ----------
const toc = [
  center("СОДЕРЖАНИЕ", { bold: true, size: 28, after: 200 }),
  new TableOfContents("Содержание", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
];

// ---------- содержание документа ----------
const body = [];
const push = (...x) => x.forEach((e) => body.push(e));

push(h1("Введение"));
push(p("Современные модели машинного обучения, в особенности глубокие нейронные сети, достигли высокого качества в задачах классификации изображений. Однако в 2013–2014 годах было обнаружено, что такие модели уязвимы к состязательным примерам (adversarial examples) — намеренно искажённым входным данным, визуально неотличимым от исходных, но приводящим модель к ошибочным предсказаниям с высокой уверенностью."));
push(p("Эта уязвимость представляет угрозу безопасности систем, использующих ML: от систем распознавания дорожных знаков до медицинской диагностики и биометрии. Поэтому изучение атак и методов защиты — актуальная задача доверенного искусственного интеллекта (Trustworthy AI)."));
push(p("В настоящей работе разработана программная система, которая в автоматическом итеративном режиме демонстрирует противоборство «атака ↔ защита»: модель атакуется состязательной атакой из библиотеки Adversarial Robustness Toolbox (ART), её качество под атакой падает, после чего применяется защита — состязательное обучение (adversarial training), — и качество восстанавливается. Цикл повторяется 10 итераций."));

push(h1("1 Цель и задачи"));
push(p("Цель работы — разработать итеративный «атакователь» ML-модели и продемонстрировать эффективность состязательного обучения как защиты, проведя 10 итераций цикла «атака — защита» с измерением метрик качества."));
push(p("Для достижения цели поставлены следующие задачи:"));
push(bullet("обучить базовую модель-классификатор (свёрточную нейросеть) на наборе данных MNIST;"));
push(bullet("реализовать модуль-«атакователь», принимающий модель из файла и применяющий атаки из ART (FGSM и PGD);"));
push(bullet("реализовать модуль защиты на основе состязательного обучения;"));
push(bullet("реализовать оркестратор итеративного цикла на 10 итераций с логированием метрик;"));
push(bullet("визуализировать результаты и проанализировать динамику робастности;"));
push(bullet("экспортировать итоговую устойчивую модель в формат ONNX для переносимости."));

push(h1("2 Теоретическая часть"));
push(h2("2.1 Состязательные примеры"));
push(p("Состязательный пример — это вход x' = x + δ, где возмущение δ ограничено по норме (‖δ‖∞ ≤ ε) и визуально незаметно, но модель классифицирует x' неверно. Существование таких примеров впервые показано в работе Szegedy и соавторов (2013), а гипотеза линейности, объясняющая их, предложена Goodfellow и соавторами (2014)."));
push(h2("2.2 Атака FGSM"));
push(p("FGSM (Fast Gradient Sign Method) — одношаговая атака, сдвигающая вход на величину ε в направлении знака градиента функции потерь по входу:"));
push(center("x' = x + ε · sign(∇ₓ J(θ, x, y)).", { italics: true, after: 120 }));
push(p("Атака быстрая, но относительно слабая, так как использует лишь один шаг."));
push(h2("2.3 Атака PGD"));
push(p("PGD (Projected Gradient Descent) — итеративное усиление FGSM: на каждом шаге делается малый шаг по знаку градиента с последующей проекцией на ε-окрестность S исходной точки:"));
push(center("xᵗ⁺¹ = Proj_S( xᵗ + α · sign(∇ₓ J(θ, xᵗ, y)) ).", { italics: true, after: 120 }));
push(p("PGD считается «сильнейшей атакой первого порядка» и используется как стандарт для оценки устойчивости. В работе PGD применяется как основная атака для оценки и как внутренний максимизатор при состязательном обучении."));
push(h2("2.4 Adversarial Robustness Toolbox (ART)"));
push(p("ART — открытая библиотека (проект Linux Foundation AI) для исследования устойчивости ML. Она предоставляет единый интерфейс «классификатор + атака»: модель оборачивается в PyTorchClassifier, после чего к ней применяются атаки FastGradientMethod, ProjectedGradientDescent и другие. В проекте ART используется как источник атак и как обёртка модели при оценке."));
push(h2("2.5 Состязательное обучение"));
push(p("Состязательное обучение (adversarial training, Madry и соавторы, 2017) — защита, при которой модель дообучается на состязательных примерах. Формально это решение минимаксной задачи:"));
push(center("min_θ  E_(x,y) [ max_{‖δ‖∞ ≤ ε}  J(θ, x + δ, y) ].", { italics: true, after: 120 }));
push(p("Внутренний максимум приближается атакой (PGD), внешний минимум — обычным шагом оптимизации. Ключевая деталь корректной реализации (см. раздел 4): состязательные примеры должны генерироваться заново для каждого батча против текущих весов модели."));

push(h1("3 Данные и модель"));
push(h2("3.1 Набор данных MNIST"));
push(p("Используется классический набор MNIST: 70 000 изображений рукописных цифр размером 28×28 пикселей в градациях серого (60 000 — обучение, 10 000 — тест), значения нормированы в диапазон [0, 1]. Загрузка выполняется средствами ART (art.utils.load_mnist) с автоматическим кэшированием."));
push(h2("3.2 Архитектура модели"));
push(p("Модель — свёрточная нейронная сеть (CNN): два свёрточных слоя 3×3 (32 и 64 канала) с функцией активации ReLU, слой подвыборки MaxPool 2×2, прореживание (Dropout), затем полносвязный слой на 128 нейронов и выходной слой на 10 классов. Базовая точность на чистом тесте составила 98.8 %."));

push(h1("4 Методика эксперимента"));
push(h2("4.1 Итеративный цикл «атака — защита»"));
push(p("Базовая модель сохраняется в файл и подаётся «на вход» атакователю (этим реализовано требование «на вход приходит ML-модель в виде файла»). Далее выполняется 10 итераций, на каждой из которых:"));
push(bullet("измеряется точность под атакой PGD (и FGSM) — это качество ДО защиты текущей итерации (оно падает);"));
push(bullet("выполняется одна эпоха состязательного обучения — защита;"));
push(bullet("повторно измеряется точность под PGD — качество ПОСЛЕ защиты (растёт);"));
push(bullet("метрики логируются, модель итерации сохраняется в файл."));
push(p("Оценка устойчивости на каждой итерации ведётся атакой PGD из ART при фиксированной конфигурации (ε = 0.2, 40 шагов), поэтому метрики сопоставимы между итерациями, а кривая робастности отражает реальный прогресс."));
push(h2("4.2 Форматы модели: pickle и ONNX"));
push(p("Канонический формат пайплайна — PyTorch .pt (сериализация pickle): атакователь принимает модель именно как файл .pt. Итоговая устойчивая модель дополнительно экспортируется в формат ONNX (torch.onnx.export) и проверяется через onnxruntime; максимальное расхождение выходов PyTorch и ONNX составило порядка 1·10⁻⁵, что подтверждает корректность экспорта и переносимость модели."));
push(h2("4.3 Параметры эксперимента"));
push(...[
  table(["Параметр", "Значение"],
    [
      ["Набор данных", "MNIST, значения в [0, 1]"],
      ["Базовое обучение", "Adam, lr = 1e-3, batch = 128, 3 эпохи"],
      ["Атака PGD (оценка)", "L∞, ε = 0.2, шаг = 0.01, 40 итераций"],
      ["Атака PGD (обучение защиты)", "L∞, ε = 0.2, шаг = 0.05, 7 итераций, генерация per-batch"],
      ["Атака FGSM (сравнение)", "L∞, ε = 0.2"],
      ["Число итераций цикла", "10 (по 1 эпохе обучения)"],
      ["Обучающая подвыборка", "20 000 изображений"],
      ["Подвыборка для оценки атак", "2 000 тест-изображений"],
      ["Устройство", "GPU NVIDIA (CUDA)"],
    ], [4000, 5355]),
]);

push(h1("5 Программная реализация"));
push(p("Проект организован модульно; каждый модуль имеет одну зону ответственности:"));
push(bullet("data.py — загрузка MNIST; model.py — архитектура CNN и сохранение/загрузка .pt;"));
push(bullet("attacker.py — обёртка модели в ART и атаки FGSM/PGD;"));
push(bullet("defense.py — состязательное обучение; pipeline.py — оркестратор 10 итераций;"));
push(bullet("plots.py — графики; export_onnx.py — экспорт в ONNX."));
push(p("Запуск всего эксперимента выполняется одной командой (python run_all.py); для разворачивания на новой машине предусмотрен установщик install.py, создающий изолированное окружение. Ниже приведён ключевой фрагмент модуля защиты — генерация PGD-примеров для каждого батча против текущих весов:"));
push(...code([
  "def adversarial_train_epoch(model, optimizer, x, y, device,",
  "                            eps=0.2, alpha=0.05, steps=7, batch_size=128):",
  "    model.train()",
  "    perm = torch.randperm(x.shape[0], device=device)",
  "    for i in range(0, x.shape[0], batch_size):",
  "        b = perm[i:i + batch_size]",
  "        xb, yb = x[b], y[b]",
  "        x_adv = pgd_perturb(model, xb, yb, eps, alpha, steps)  # против текущих весов",
  "        optimizer.zero_grad()",
  "        loss = F.cross_entropy(model(x_adv), yb)",
  "        loss.backward()",
  "        optimizer.step()",
]));

push(h1("6 Результаты"));
push(h2("6.1 Эффект атаки на базовую модель"));
push(p("Базовая модель показывает на чистом тесте точность 98.8 %. Однако под атакой её качество катастрофически падает: PGD при ε = 0.2 снижает точность до 2.0 % (успех атаки 98 %), а более слабая атака FGSM — до 48.9 %. Это подтверждает уязвимость обычной модели и то, что PGD существенно сильнее FGSM."));
push(h2("6.2 Динамика по итерациям"));
push(p("В таблице 1 приведены метрики по 10 итерациям цикла (в процентах). Видно, что после первой же итерации состязательного обучения точность под PGD выросла с 2.0 % до 80.5 %, а к десятой итерации устойчивость достигла 92.3 % при сохранении точности на чистом тесте около 98.7 %. Успех атаки снизился с 98 % до 8.4 %."));
push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 80 },
  children: [new TextRun({ text: "Таблица 1 — Метрики по итерациям, %", italics: true, size: 24 })] }));
push(table(["Итер.", "Чистый тест", "FGSM до", "PGD до", "PGD после", "Успех атаки"],
  iterRows, [1255, 1620, 1620, 1620, 1620, 1620]));
push(...img("accuracy_curves.png", 600, 375, "Рисунок 1 — Точность модели по итерациям (атака ↔ защита)"));
push(p("На рисунке 1 чистая точность (синяя линия) стабильна, а точность под PGD до защиты (зелёная) растёт от 2 % до 92 %, отражая накопление устойчивости. Кривая FGSM лежит выше PGD, что согласуется с тем, что FGSM — более слабая атака."));
push(h2("6.3 Успех атаки"));
push(...img("attack_success.png", 600, 375, "Рисунок 2 — Доля успешных атак PGD по итерациям"));
push(p("Рисунок 2 показывает падение доли успешных атак: если на базовой модели PGD успешен в 98 % случаев, то после состязательного обучения — лишь в 8 %."));
push(h2("6.4 Примеры состязательных изображений"));
push(...img("adv_examples_grid.png", 620, 341, "Рисунок 3 — Оригинал и состязательный пример (предсказания базовой и устойчивой моделей)"));
push(p("На рисунке 3 видно, что одно и то же PGD-возмущение обманывает базовую модель (предсказания во втором ряду неверны, отмечены красным), но не итоговую устойчивую модель (третий ряд, верные предсказания отмечены зелёным). Возмущение визуально проявляется как слабый «шум» вокруг цифры."));
push(h2("6.5 Устойчивость при разной силе атаки"));
push(p("В дополнительном эксперименте сравнивалась устойчивость базовой и итоговой моделей при разной силе атаки ε (таблица 2, рисунок 4). Устойчивая модель превосходит базовую при всех ε; при ε = 0.2 (на которое велось обучение) её точность 92.4 % против 2.2 % у базовой. При ε > 0.2 устойчивость закономерно снижается, так как обучение велось на ε = 0.2."));
push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 80 },
  children: [new TextRun({ text: "Таблица 2 — Точность под PGD при разной силе атаки, %", italics: true, size: 24 })] }));
push(table(["ε (сила атаки)", "Базовая модель", "Устойчивая модель"], epsRows, [3119, 3118, 3118]));
push(...img("epsilon_sweep.png", 600, 375, "Рисунок 4 — Устойчивость к PGD при разной силе атаки ε"));

push(h1("7 Обсуждение"));
push(p("В ходе работы был выявлен и устранён характерный методический подвох. В первой версии защиты состязательные примеры генерировались один раз за итерацию по фиксированной подвыборке: при этом точность под адаптивной атакой не росла (оставалась около 1–12 %), хотя на вид «обучение шло». Причина в том, что модель «запоминала» конкретные возмущения, но оставалась уязвимой к свежей атаке, перестроенной под обновлённые веса."));
push(p("Решение — генерировать состязательные примеры заново для каждого батча против текущих весов модели (корректная реализация подхода Madry). После этой правки устойчивость к PGD стала уверенно расти: 2.0 % → 80.5 % → … → 92.3 %. Этот результат подчёркивает, что качество защиты определяется не фактом обучения «на adversarial-данных», а тем, насколько атака при обучении адаптивна к модели."));

push(h1("Выводы"));
push(p("В работе разработан итеративный «атакователь» ML-модели и реализована защита через состязательное обучение. Получены следующие результаты:"));
push(bullet("атака PGD из ART снижает точность базовой модели с 98.8 % до 2.0 % (успех атаки 98 %);"));
push(bullet("состязательное обучение за 10 итераций повышает устойчивость к PGD до 92.3 % при сохранении точности на чистых данных (~98.7 %);"));
push(bullet("успех атаки падает с 98 % до 8 %; устойчивая модель превосходит базовую при всех значениях ε;"));
push(bullet("итоговая модель экспортирована в ONNX (расхождение с PyTorch ~1·10⁻⁵);"));
push(bullet("показано, что ключ к работающей защите — адаптивная (per-batch) генерация состязательных примеров."));
push(p("Таким образом, цель работы достигнута: продемонстрировано противоборство «атака — защита» и эффективность состязательного обучения как меры повышения робастности."));

push(h1("Список литературы"));
const refs = [
  "Szegedy C. et al. Intriguing properties of neural networks. — arXiv:1312.6199, 2013.",
  "Goodfellow I., Shlens J., Szegedy C. Explaining and Harnessing Adversarial Examples. — ICLR, 2015.",
  "Madry A. et al. Towards Deep Learning Models Resistant to Adversarial Attacks. — ICLR, 2018.",
  "Nicolae M.-I. et al. Adversarial Robustness Toolbox v1.0.0. — arXiv:1807.01069, 2018.",
  "Adversarial Robustness Toolbox — документация. URL: https://adversarial-robustness-toolbox.readthedocs.io",
  "LeCun Y., Cortes C., Burges C. The MNIST database of handwritten digits.",
];
refs.forEach((r, i) => push(new Paragraph({ numbering: { reference: "refs", level: 0 },
  alignment: AlignmentType.JUSTIFIED, spacing: { line: 360 }, children: [new TextRun(r)] })));

// ---------- сборка документа ----------
const doc = new Document({
  styles: {
    default: { document: { run: { font: TNR, size: 28 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: TNR }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: TNR }, paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "—", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1066, hanging: 357 } } } }] },
      { reference: "refs", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 714, hanging: 357 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 },
        margin: { top: 1134, right: 850, bottom: 1134, left: 1701 } },
      titlePage: true,
    },
    footers: {
      first: new Footer({ children: [new Paragraph({})] }),
      default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: 24 })] })] }),
    },
    children: [...title, ...toc, ...body],
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("OK:", OUT); });
