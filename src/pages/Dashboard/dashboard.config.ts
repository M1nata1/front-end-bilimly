// src/pages/Dashboard/dashboard.config.ts

export const BRAND = {
  name:   "Bilim",
  accent: "Ly",
};

export const COLORS = {
  bgPage:       "#0D0D11",
  bgSection:    "#0A0A0E",
  bgCard:       "#13131A",
  bgCardHover:  "#161620",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,58,58,0.3)",
  accent:       "#FF3A3A",
  accentHover:  "#FF5555",
  accentSoft:   "rgba(255,58,58,0.08)",
  accentBorder: "rgba(255,58,58,0.2)",
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

export const COPY = {
  greeting:   "Добро пожаловать",
  subtitle:   "Выбери с чего начать сегодня",
  btnLogout:  "Выйти",
  navCourses: "Курсы",
  navExam:    "Экзамен",

  cards: [
    {
      key:   "courses",
      href:  "/courses",
      label: "Курсы",
      title: "Изучай темы",
      desc:  "Статьи и тесты по всем предметам КТ",
      link:  "Перейти к курсам",
    },
    {
      key:   "exam",
      href:  "/exam",
      label: "Экзамен",
      title: "Пробный КТ",
      desc:  "Реальный формат с таймером и разбором ошибок",
      link:  "Начать экзамен",
    },
  ],

  // Плашка подписки
  subscription: {
    active:   "Подписка активна",
    inactive: "Нет активной подписки",
    expires:  "Действует до",
    tariff:   "Тариф",
    btnBuy:   "Оформить подписку",
  },
};
