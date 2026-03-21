// src/pages/Exam/trialExam.config.ts
// ============================================================
//  ВСЯ КОНФИГУРАЦИЯ ПРОБНОГО ЭКЗАМЕНА
// ============================================================

export const BRAND = { name: "Bilim", accent: "Ly" };

export const COLORS = {
  bgPage:       "#0D0D11",
  bgCard:       "#13131A",
  border:       "rgba(255,255,255,0.07)",
  accent:       "#FF3A3A",
  accentHover:  "#FF5555",
  accentSoft:   "rgba(255,58,58,0.08)",
  accentBorder: "rgba(255,58,58,0.2)",
  correct:      "rgba(34,197,94,0.13)",
  correctBorder:"rgba(34,197,94,0.38)",
  correctText:  "#4ADE80",
  wrong:        "rgba(255,58,58,0.10)",
  wrongBorder:  "rgba(255,58,58,0.35)",
  textPrimary:  "#FAFAFF",
  textBody:     "#F0F0FF",
  textMuted:    "#8888AA",
  textFaint:    "#44445A",
};

export const FONTS = {
  display:   "'Syne', sans-serif",
  body:      "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// ── Типы ──────────────────────────────────────────────────────
export type SubjectId = "tgo" | "english";
export type Phase     = "intro" | "exam" | "result";

export type Question = {
  id:      number;
  subject: SubjectId;
  text:    string;
  options: string[];
  correct: number;
};

export type Subject = {
  id:          SubjectId;
  name:        string;
  shortName:   string;
  color:       string;
  count:       number;
  durationMin: number;
  maxScore:    number;
};

// ── Предметы ──────────────────────────────────────────────────
export const SUBJECTS: Subject[] = [
  { id: "tgo",     name: "ТГО",             shortName: "ТГО",   color: "#3A8EFF", count: 30, durationMin: 50, maxScore: 30 },
  { id: "english", name: "Английский язык", shortName: "Англ.", color: "#FF3A3A", count: 50, durationMin: 75, maxScore: 50 },
];

// Глобальный индекс первого вопроса каждого предмета
export const SUBJECT_START: Record<SubjectId, number> = { tgo: 0, english: 30 };

export const TOTAL_QUESTIONS    = SUBJECTS.reduce((s, sub) => s + sub.count, 0); // 80
export const TRIAL_DURATION_SEC = 125 * 60; // 7500 сек = 2 ч 05 мин

// ── Тексты ────────────────────────────────────────────────────
export const COPY = {
  pageLabel:   "Пробный КТ",
  pageTitle:   "Обязательные предметы",
  btnStart:    "Начать экзамен",
  btnFinish:   "Завершить тест",
  btnNext:     "Следующий",
  btnPrev:     "Предыдущий",
  timerLabel:  "Осталось",
  resultTitle: "Результаты экзамена",
  btnRestart:  "Пройти ещё раз",
  btnRegister: "Зарегистрироваться для полного КТ",
  notePublic:  "Пробный экзамен включает только обязательные предметы — ТГО и Английский язык. Для полного КТ с профильными дисциплинами нужна регистрация.",
};

// ── Вопросы ───────────────────────────────────────────────────
// TODO: заменить на fetch /api/exam/trial/ при появлении эндпоинта
// Порядок: первые 30 — ТГО, следующие 50 — Английский язык

const TGO_MOCK: Question[] = [
  { id:  1, subject: "tgo", text: "Какое государство является непосредственным соседом Казахстана на севере?", options: ["Россия", "Китай", "Киргизия", "Туркменистан"], correct: 0 },
  { id:  2, subject: "tgo", text: "В каком году Казахстан провозгласил независимость?", options: ["1990", "1991", "1992", "1993"], correct: 1 },
  { id:  3, subject: "tgo", text: "Столица Казахстана:", options: ["Алматы", "Шымкент", "Астана", "Актобе"], correct: 2 },
  { id:  4, subject: "tgo", text: "Найдите значение выражения: 15 × 4 − 20 ÷ 5", options: ["52", "56", "60", "48"], correct: 1 },
  { id:  5, subject: "tgo", text: "Если скорость поезда 80 км/ч, за сколько часов он проедет 320 км?", options: ["3", "4", "5", "6"], correct: 1 },
  { id:  6, subject: "tgo", text: "Сколько областей в Казахстане (на 2024 год)?", options: ["14", "16", "17", "19"], correct: 2 },
  { id:  7, subject: "tgo", text: "Первый Президент Казахстана:", options: ["К. Токаев", "Н. Назарбаев", "А. Байменов", "И. Тасмагамбетов"], correct: 1 },
  { id:  8, subject: "tgo", text: "Найдите 30% от числа 250:", options: ["65", "70", "75", "80"], correct: 2 },
  { id:  9, subject: "tgo", text: "Какая река является самой длинной в Казахстане?", options: ["Иртыш", "Сырдарья", "Или", "Урал"], correct: 1 },
  { id: 10, subject: "tgo", text: "Треугольник со сторонами 3, 4 и 5 является:", options: ["Равносторонним", "Тупоугольным", "Прямоугольным", "Равнобедренным"], correct: 2 },
  ...Array.from({ length: 20 }, (_, i): Question => ({
    id: i + 11, subject: "tgo",
    text: `ТГО · Вопрос ${i + 11} — будет загружен с сервера`,
    options: ["Вариант A", "Вариант B", "Вариант C", "Вариант D"], correct: 0,
  })),
];

const ENGLISH_MOCK: Question[] = [
  { id: 31, subject: "english", text: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "went"], correct: 1 },
  { id: 32, subject: "english", text: "What is the synonym of 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], correct: 2 },
  { id: 33, subject: "english", text: "Fill in the blank: He has ___ finished his homework.", options: ["yet", "still", "already", "just yet"], correct: 2 },
  { id: 34, subject: "english", text: "Choose the correct article: I saw ___ elephant at the zoo.", options: ["a", "an", "the", "—"], correct: 1 },
  { id: 35, subject: "english", text: "What does 'enormous' mean?", options: ["Tiny", "Average", "Very large", "Beautiful"], correct: 2 },
  { id: 36, subject: "english", text: "By the time she arrived, we ___ dinner.", options: ["have had", "had had", "had", "were having"], correct: 1 },
  { id: 37, subject: "english", text: "Which word is an antonym of 'ancient'?", options: ["Old", "Modern", "Historic", "Classic"], correct: 1 },
  { id: 38, subject: "english", text: "She is interested ___ music.", options: ["at", "in", "on", "for"], correct: 1 },
  { id: 39, subject: "english", text: "The passive form of 'They built the bridge' is:", options: ["The bridge was built.", "The bridge has built.", "The bridge built.", "The bridge is built."], correct: 0 },
  { id: 40, subject: "english", text: "What does 'meticulous' mean?", options: ["Careless", "Showing great attention to detail", "Very fast", "Extremely loud"], correct: 1 },
  ...Array.from({ length: 40 }, (_, i): Question => ({
    id: i + 41, subject: "english",
    text: `English · Question ${i + 11} — will be loaded from server`,
    options: ["Option A", "Option B", "Option C", "Option D"], correct: 0,
  })),
];

export const ALL_QUESTIONS: Question[] = [...TGO_MOCK, ...ENGLISH_MOCK];

// ── Хелперы ───────────────────────────────────────────────────
export const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export const formatTime = (sec: number) => {
  const s = Math.max(0, sec);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};

export const subjectOf = (globalIdx: number): SubjectId =>
  globalIdx < SUBJECT_START.english ? "tgo" : "english";
