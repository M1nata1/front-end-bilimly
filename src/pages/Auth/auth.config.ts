// src/pages/Auth/auth.config.ts
// ============================================================
//  ВСЯ КОНФИГУРАЦИЯ СТРАНИЦЫ АВТОРИЗАЦИИ
// ============================================================

export const BRAND = {
  name:   "Bilim",
  accent: "Ly",
  year:   "2025",
};

// --- API ---
// baseUrl без /api — пути уже содержат полный роут
export const API = {
  baseUrl:  "http://localhost:8000",      // URL
  login:    "/users/auth/login/",         // POST { email, password } → { access, refresh }
  register: "/users/auth/register/",      // POST { email, username, password, phone_number }
  refresh:  "/users/auth/token/refresh/", // POST { refresh } → { access }
};

export const REDIRECT = {
  student: "/dashboard",
  admin:   "/admin",
};

// --- Тексты ---
export const COPY = {
  label:      "Добро пожаловать",
  errEmpty:   "Заполни все поля",
  errInvalid: "Неверный email или пароль",
  errLimit:   "Слишком много попыток. Попробуй позже.",
  errServer:  "Ошибка сервера. Попробуй позже.",
  okRegister: "Аккаунт создан. Теперь можно войти.",
  okForgot:   "Пока недоступно. Напиши в поддержку, и мы поможем восстановить доступ.",
  backToMenu: "В главное меню",
  login: {
    title:         "Войти",
    subtitle:      "Email и пароль",
    labelEmail:    "Email",
    labelPass:     "Пароль",
    btnSubmit:     "Войти",
    btnLoading:    "Входим...",
    forgot:        "Забыл пароль?",
    toRegister:    "Нет аккаунта?",
    toRegisterBtn: "Регистрация",
  },
  register: {
    title:         "Регистрация",
    subtitle:      "Создай аккаунт, чтобы сохранялся прогресс.",
    labelEmail:    "Email",
    labelUsername: "Имя пользователя",
    labelPhone:    "Телефон",
    labelPass:     "Пароль",
    btnSubmit:     "Создать аккаунт",
    btnLoading:    "Создаём...",
    toLogin:       "Уже есть аккаунт?",
    toLoginBtn:    "Войти",
  },
  forgot: {
    title:     "Восстановление",
    subtitle:  "Если не помнишь пароль — поможем восстановить доступ.",
    back:      "Назад ко входу",
    btnSubmit: "Понятно",
  },
};

// --- Цвета ---
export const COLORS = {
  bgPage:      "#0D0D11",
  bgLeft:      "#0A0A0E",
  bgRight:     "#0E0E14",
  bgInput:     "#13131A",
  border:      "rgba(255,255,255,0.08)",
  borderFocus: "rgba(255,58,58,0.5)",
  accent:      "#FF3A3A",
  accentHover: "#FF5555",
  textPrimary: "#FAFAFF",
  textBody:    "#F0F0FF",
  textFaint:   "#44445A",
  errBg:       "rgba(255,58,58,0.08)",
  errBorder:   "rgba(255,58,58,0.2)",
  errText:     "#FF6B6B",
  okBg:        "rgba(34,197,94,0.08)",
  okBorder:    "rgba(34,197,94,0.18)",
  okText:      "#4ADE80",
};

// --- Шрифты ---
export const FONTS = {
  display:   "'Syne', sans-serif",
  body:      "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// --- Правая сцена — анимация ---
export const RIGHT_SCENE = {
  layout: {
    minHeightDesktop: "100vh",
    minHeightMobile:  "420px",
  },
  motion: {
    itemPulseScale:   0.04,  // амплитуда плавания элементов
    blobPulseScale:   0.06,  // амплитуда фоновых пятен
    blobSyncDuration: 8.6,   // единый ритм пятен (сек)
    shakeDuration:    0.55,  // дрожание при ошибке (сек)
  },
  backgrounds: [
    { width: 520, height: 360, top: "-8%", left: "-6%", color: "rgba(255,58,58,0.12)",  blur: 90, duration: 8.6, fx: 26, fy: 18, pulse: 0.060, delay: 0.00 },
    { width: 520, height: 360, top: "58%", left: "64%", color: "rgba(58,142,255,0.11)", blur: 96, duration: 8.6, fx: 22, fy: 20, pulse: 0.050, delay: 0.15 },
    { width: 460, height: 300, top: "18%", left: "66%", color: "rgba(34,197,94,0.10)",  blur: 84, duration: 8.6, fx: 18, fy: 16, pulse: 0.055, delay: 0.30 },
  ],
};

// --- Плавающие элементы правой сцены ---
export type StudyItemKind = "chip" | "formula" | "icon";
export type StudyIconName = "sigma" | "atom" | "graph" | "book" | "pi" | "ruler" | "flask";

export type StudyItem = {
  top: string; left: string;
  rotate: number; scale: number;
  delay: number; duration: number;
  fx: number; fy: number; fr: number;
  kind: StudyItemKind;
  text?: string;
  icon?: StudyIconName;
};

export const STUDY_ITEMS: StudyItem[] = [
  { top:  "7%", left: "16%", rotate: -12, scale: 1.02, delay: 0.00, duration:  7.1, fx: 14, fy: 18, fr:  4, kind: "formula", text: "E = mc²"         },
  { top: "10%", left: "34%", rotate:   7, scale: 0.96, delay: 0.20, duration:  8.6, fx: 10, fy: 14, fr: -3, kind: "chip",    text: "тест"             },
  { top: "14%", left: "62%", rotate:  12, scale: 0.95, delay: 0.35, duration:  9.2, fx: 12, fy: 20, fr:  5, kind: "icon",    icon: "atom"             },
  { top: "17%", left: "80%", rotate:  -8, scale: 0.92, delay: 0.15, duration:  7.4, fx:  8, fy: 13, fr: -4, kind: "formula", text: "a² + b²"          },
  { top: "23%", left: "22%", rotate:  10, scale: 0.98, delay: 0.45, duration:  8.4, fx: 16, fy: 12, fr:  3, kind: "icon",    icon: "pi"               },
  { top: "26%", left: "44%", rotate:  -5, scale: 1.04, delay: 0.25, duration:  7.8, fx: 11, fy: 16, fr: -2, kind: "formula", text: "∫ f(x)dx"         },
  { top: "29%", left: "72%", rotate: -10, scale: 1.02, delay: 0.55, duration:  9.6, fx: 13, fy: 18, fr:  6, kind: "chip",    text: "таймер"           },
  { top: "34%", left: "12%", rotate:   8, scale: 1.00, delay: 0.65, duration:  8.9, fx: 15, fy: 15, fr:  4, kind: "icon",    icon: "sigma"            },
  { top: "38%", left: "32%", rotate:  14, scale: 0.94, delay: 0.30, duration:  9.9, fx: 11, fy: 20, fr:  5, kind: "chip",    text: "шпаргалка"        },
  { top: "41%", left: "51%", rotate: -14, scale: 1.08, delay: 0.10, duration:  7.0, fx: 12, fy: 16, fr: -5, kind: "formula", text: "Δ = b² - 4ac"     },
  { top: "45%", left: "76%", rotate:   8, scale: 0.98, delay: 0.50, duration:  8.1, fx: 17, fy: 15, fr:  4, kind: "icon",    icon: "graph"            },
  { top: "51%", left: "18%", rotate:  -6, scale: 1.02, delay: 0.75, duration:  9.4, fx: 14, fy: 18, fr: -3, kind: "chip",    text: "вопрос 47"        },
  { top: "54%", left: "38%", rotate:  11, scale: 0.97, delay: 0.18, duration:  7.6, fx: 10, fy: 13, fr:  2, kind: "icon",    icon: "book"             },
  { top: "59%", left: "61%", rotate:   9, scale: 1.05, delay: 0.60, duration:  8.8, fx: 15, fy: 12, fr:  5, kind: "formula", text: "sin²x + cos²x = 1"},
  { top: "62%", left: "83%", rotate:  -4, scale: 0.94, delay: 0.34, duration: 10.1, fx: 12, fy: 18, fr: -4, kind: "chip",    text: "балл"             },
  { top: "67%", left: "11%", rotate:  13, scale: 0.95, delay: 0.48, duration:  8.2, fx: 11, fy: 20, fr:  6, kind: "icon",    icon: "ruler"            },
  { top: "71%", left: "30%", rotate:  -9, scale: 1.01, delay: 0.22, duration:  9.3, fx: 18, fy: 14, fr: -3, kind: "formula", text: "logₐb"            },
  { top: "74%", left: "49%", rotate:   6, scale: 0.96, delay: 0.70, duration:  7.3, fx: 14, fy: 16, fr:  2, kind: "chip",    text: "заметки"          },
  { top: "79%", left: "69%", rotate:  -7, scale: 1.06, delay: 0.42, duration:  8.7, fx: 13, fy: 18, fr: -5, kind: "formula", text: "P(A|B)"           },
  { top: "83%", left: "87%", rotate:  12, scale: 0.92, delay: 0.12, duration:  9.5, fx: 10, fy: 12, fr:  4, kind: "icon",    icon: "flask"            },
  { top: "86%", left: "21%", rotate: -11, scale: 1.00, delay: 0.58, duration:  8.0, fx: 16, fy: 18, fr: -4, kind: "chip",    text: "формулы"          },
  { top: "89%", left: "53%", rotate:   5, scale: 0.95, delay: 0.26, duration:  9.0, fx: 11, fy: 17, fr:  3, kind: "formula", text: "x̄ = Σx / n"      },
  { top: "91%", left: "76%", rotate:  -8, scale: 0.92, delay: 0.68, duration: 10.2, fx: 13, fy: 13, fr: -2, kind: "chip",    text: "вариант A"        },
];
