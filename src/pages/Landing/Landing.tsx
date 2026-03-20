// src/pages/Landing/Landing.tsx

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
//  КОНФИГУРАЦИЯ
// ============================================================

const BRAND = {
  name:   "Bilim",
  accent: "Ly",
  year:   "2025",
};

const COLORS = {
  bgPage:       "#0D0D11",
  bgSection:    "#0A0A0E",
  bgCard:       "#13131A",
  border:       "rgba(255,255,255,0.07)",
  borderHover:  "rgba(255,58,58,0.35)",
  accent:       "#FF3A3A",
  accentHover:  "#FF5555",
  accentSoft:   "rgba(255,58,58,0.08)",
  accentBorder: "rgba(255,58,58,0.15)",
  accentText:   "#FF5555",
  textPrimary:  "#FAFAFF",
  textBody:     "#F0F0FF",
  textMuted:    "#66668A",
  textFaint:    "#44445A",
  textGhost:    "#2A2A3A",
};

const FONTS = {
  display:   "'Syne', sans-serif",
  body:      "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// --- Навигация ---
// action: "scroll:#id"       — плавный скролл к секции на этой странице
//         "route:/path"      — переход на страницу
//         "route:/path#hash" — переход на страницу + хэш (якорь в FAQ)
const NAV_LINKS: { label: string; action: string }[] = [
  { label: "О платформе", action: "route:/faq#about"  },
  { label: "Курсы",       action: "scroll:#courses"   },
  { label: "Экзамен",     action: "scroll:#exam-cta"  },
  { label: "FAQ",         action: "route:/faq"         },
];

const NAV_BTN_LABEL = "Войти";

// --- Hero ---
const HERO = {
  label:        "Подготовка к КТ",
  titleLine1:   "Сдай КТ",
  titleLine2:   "на максимум",
  titleLine3:   "с первой попытки",
  description:  "Курсы по всем предметам, мини-тесты и реальный формат экзамена с таймером — всё в одном месте.",
  btnPrimary:   "Начать подготовку",
  btnSecondary: "Смотреть курсы",
};

const HERO_STATS = [
  { value: "3 000+", label: "вопросов"     },
  { value: "94%",    label: "сдают с нами" },
  { value: "12+",    label: "предметов"    },
];

// --- Демо-карточка экзамена в Hero ---
const EXAM_DEMO = {
  label:           "Пробный экзамен",
  timerLabel:      "Оставшееся время",
  timer:           "01:45:33",
  progressLabel:   "Прогресс",
  progressCurrent: 20,
  progressTotal:   100,
  questionNum:     47,
  questionText:    "Какой год считается датой принятия первой Конституции Казахстана?",
  options: [
    { label: "1991", correct: false },
    { label: "1995", correct: true  },
    { label: "1993", correct: false },
    { label: "1997", correct: false },
  ],
};

// --- Курсы ---
const COURSES_SECTION = {
  label:       "Курсы",
  title:       "Все предметы КТ",
  description: "",
};

const SUBJECTS = [
  { name: "Английский язык",                                     color: "#FF3A3A", topics: 24 },
  { name: "ТГО",                                                 color: "#3A8EFF", topics: 31 },
  { name: "M093 Механика",                                       color: "#06B6D4", topics: 19 },
  { name: "M094 Информационные технологии",                      color: "#A855F7", topics: 18 },
  { name: "M095 Информационная безопасность",                    color: "#22C55E", topics: 22 },
  { name: "M096 Коммуникации и коммуникационные технологии",     color: "#F59E0B", topics: 27 },
];

// --- Шаги ---
const HOW_SECTION = {
  label: "Как это работает",
  title: "4 шага до магистратуры",
};

const HOW_STEPS = [
  { n: "01", title: "Выбери предмет",  desc: "Выбери нужный курс из списка предметов КТ." },
  { n: "02", title: "Читай статьи",    desc: "Каждая тема — подробная статья с примерами." },
  { n: "03", title: "Пройди тест",     desc: "Короткий тест после каждой темы для закрепления." },
  { n: "04", title: "Сдай пробный КТ", desc: "Здесь ты испытаешь все знания, которые ты получил." },
];

// --- CTA пробного КТ ---
// ПУБЛИЧНЫЙ — доступен без авторизации, только обязательные предметы
const EXAM_CTA = {
  label:       "Пробный КТ",
  title:       "Попробуй реальный формат прямо сейчас",
  description: "Таймер, 60 вопросов, анализ ошибок и итоговый балл — как на настоящем экзамене. Без регистрации.",
  features:    ["60 вопросов", "60 минут", "ТГО", "Английский язык"],
  btnLabel:    "Начать пробный экзамен",
  route:       "/exam/trial",  // публичный маршрут, только обязательные предметы
};

// --- Футер ---
const FOOTER = {
  copyright: "Все права защищены.",
  links: [
    { label: "Контакты", action: "route:/faq#contacts" },
    { label: "Политика", action: "route:/policy"       },
  ],
};

// ============================================================
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

const parseHMS = (hms: string): number => {
  const [h, m, s] = hms.split(":").map(x => parseInt(x, 10));
  return (isNaN(h) ? 0 : h) * 3600 + (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
};
const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
const formatHMS = (total: number) => {
  const t = Math.max(0, total);
  return `${pad2(Math.floor(t / 3600))}:${pad2(Math.floor((t % 3600) / 60))}:${pad2(t % 60)}`;
};

// ============================================================
//  КОМПОНЕНТ
// ============================================================

export default function Landing() {
  const navigate = useNavigate();
  const isAuth   = useAuthStore(s => s.isAuth);
  const [scrolled, setScrolled] = useState(false);
  const initialSeconds = useMemo(() => parseHMS(EXAM_DEMO.timer), []);
  const [left, setLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (left <= 0) return;
    const t0 = Date.now();
    let raf: number | null = null;
    let last = left;
    const tick = () => {
      const next = initialSeconds - Math.floor((Date.now() - t0) / 1000);
      if (next !== last) { last = next; setLeft(next); }
      if (next > 0) raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [initialSeconds]);

  // Универсальный обработчик действий из nav и footer
  const handleAction = (action: string) => {
    if (action.startsWith("scroll:")) {
      const selector = action.replace("scroll:", "");
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (action.startsWith("route:")) {
      navigate(action.replace("route:", ""));
    }
  };

  // Кнопки CTA требуют авторизации
  const handleCTA     = () => navigate(isAuth ? "/dashboard" : "/auth");
  const handleCourses = () => document.querySelector("#courses")?.scrollIntoView({ behavior: "smooth", block: "start" });
  // Пробный КТ — публичный, не требует авторизации
  const handleTrialExam = () => navigate(EXAM_CTA.route);

  const pct = Math.round((EXAM_DEMO.progressCurrent / EXAM_DEMO.progressTotal) * 100);

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh", overflowX: "hidden" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:${COLORS.accent}30}
        .nav-link{font-size:.82rem;font-weight:600;color:${COLORS.textMuted};cursor:pointer;transition:color .18s}
        .nav-link:hover{color:${COLORS.accent}}
        .btn-red{background:${COLORS.accent};color:#fff;border:none;padding:.7rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:700;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-red:hover{background:${COLORS.accentHover};transform:translateY(-1px)}
        .btn-ghost{background:transparent;color:${COLORS.textBody};border:1px solid rgba(255,255,255,.15);padding:.7rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:600;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-ghost:hover{border-color:${COLORS.accent};color:${COLORS.accent}}
        .section-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:.6rem}
        .chip{display:flex;align-items:center;gap:.7rem;background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:10px;padding:.8rem 1rem;transition:border-color .18s;cursor:pointer}
        .chip:hover{border-color:${COLORS.borderHover}}
        .step{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:12px;padding:1.6rem;transition:border-color .18s}
        .step:hover{border-color:rgba(255,58,58,.3)}
        .feat-tag{font-size:.72rem;font-weight:700;color:${COLORS.accentText};background:${COLORS.accentSoft};border:1px solid ${COLORS.accentBorder};border-radius:6px;padding:.3rem .7rem}
        .footer-link{font-size:.72rem;color:${COLORS.textGhost};cursor:pointer;transition:color .18s}
        .footer-link:hover{color:${COLORS.accent}}
        @keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .f1{animation:fu .55s .05s ease forwards;opacity:0}
        .f2{animation:fu .55s .18s ease forwards;opacity:0}
        .f3{animation:fu .55s .3s ease forwards;opacity:0}
        .f4{animation:fu .55s .42s ease forwards;opacity:0}
        @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .bob{animation:bob 5s ease-in-out infinite}
        .num{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum","lnum";letter-spacing:0;text-rendering:optimizeLegibility}
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: ".85rem 2.5rem",
        background: scrolled ? `${COLORS.bgPage}EC` : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? `1px solid ${COLORS.border}` : "none",
        transition: "all .25s",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div
          style={{ fontFamily: FONTS.display, fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-.01em", cursor: "pointer" }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
        </div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {NAV_LINKS.map(l => (
            <span key={l.label} className="nav-link" onClick={() => handleAction(l.action)}>
              {l.label}
            </span>
          ))}
          <button className="btn-red" style={{ padding: ".45rem 1.2rem", fontSize: ".8rem" }} onClick={handleCTA}>
            {isAuth ? "Личный кабинет" : NAV_BTN_LABEL}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        padding: "5.5rem 2.5rem 3rem", maxWidth: "1080px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr minmax(0,420px)", gap: "4rem",
        alignItems: "center", minHeight: "88vh",
      }}>
        <div>
          <p className="f1 section-label">{HERO.label}</p>
          <h1 className="f2" style={{ fontFamily: FONTS.display, fontSize: "clamp(2.2rem,4vw,3.4rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.025em", color: COLORS.textPrimary, marginBottom: "1.2rem" }}>
            {HERO.titleLine1}<br />
            <span style={{ color: COLORS.accent }}>{HERO.titleLine2}</span><br />
            {HERO.titleLine3}
          </h1>
          <p className="f3" style={{ fontSize: ".95rem", color: COLORS.textMuted, lineHeight: 1.8, marginBottom: "2rem", maxWidth: "400px" }}>
            {HERO.description}
          </p>
          <div className="f4" style={{ display: "flex", gap: ".75rem" }}>
            <button className="btn-red" onClick={handleCTA}>{HERO.btnPrimary}</button>
            <button className="btn-ghost" onClick={handleCourses}>{HERO.btnSecondary}</button>
          </div>
          <div className="f4" style={{ display: "flex", gap: "2rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: `1px solid ${COLORS.border}` }}>
            {HERO_STATS.map((s, i) => (
              <div key={s.label} style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                {i > 0 && <div style={{ width: "1px", height: "30px", background: COLORS.border, marginRight: "-1rem" }} />}
                <div>
                  <div className="num" style={{ fontFamily: FONTS.display, fontSize: "1.5rem", fontWeight: 800, color: COLORS.textPrimary }}>{s.value}</div>
                  <div style={{ fontSize: ".72rem", fontWeight: 600, color: COLORS.textFaint, marginTop: ".2rem", letterSpacing: ".04em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exam demo card */}
        <div className="bob">
          <div style={{ background: COLORS.bgCard, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.4rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", background: "rgba(255,58,58,0.07)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
            <p className="section-label">{EXAM_DEMO.label}</p>
            <div style={{ background: COLORS.bgPage, borderRadius: "10px", padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: ".65rem", color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".3rem" }}>{EXAM_DEMO.timerLabel}</div>
                <div className="num" style={{ fontFamily: FONTS.display, fontSize: "1.9rem", fontWeight: 800, color: COLORS.accent }}>{formatHMS(left)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: ".65rem", color: COLORS.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: ".3rem" }}>{EXAM_DEMO.progressLabel}</div>
                <div className="num" style={{ fontFamily: FONTS.display, fontSize: "1.2rem", fontWeight: 800, color: COLORS.textPrimary }}>
                  {EXAM_DEMO.progressCurrent} <span style={{ fontSize: ".8rem", color: COLORS.textFaint, fontWeight: 400 }}>/ {EXAM_DEMO.progressTotal}</span>
                </div>
              </div>
            </div>
            <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginBottom: "1rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: COLORS.accent, borderRadius: "2px" }} />
            </div>
            <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "1rem" }}>
              <div className="num" style={{ fontSize: ".68rem", color: COLORS.accent, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".6rem" }}>
                Вопрос {EXAM_DEMO.questionNum}
              </div>
              <p style={{ fontSize: ".8rem", color: "#B0B0CC", lineHeight: 1.6, marginBottom: ".8rem" }}>{EXAM_DEMO.questionText}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".4rem" }}>
                {EXAM_DEMO.options.map(o => (
                  <div key={o.label} style={{ background: o.correct ? "rgba(255,58,58,0.1)" : COLORS.bgPage, border: `1px solid ${o.correct ? "rgba(255,58,58,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "6px", padding: ".45rem .7rem", fontSize: ".73rem", color: o.correct ? "#FF6B6B" : COLORS.textMuted, fontWeight: o.correct ? 700 : 400 }}>
                    {o.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 2.5rem" }}>
        <div style={{ height: "1px", background: COLORS.border }} />
      </div>

      {/* COURSES — якорь для nav "Курсы" */}
      <section
        id="courses"
        style={{ maxWidth: "1080px", margin: "0 auto", padding: "4rem 2.5rem", scrollMarginTop: "80px" }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p className="section-label">{COURSES_SECTION.label}</p>
            <h2 style={{ fontFamily: FONTS.display, fontSize: "1.6rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.02em" }}>{COURSES_SECTION.title}</h2>
          </div>
          {COURSES_SECTION.description && (
            <p style={{ fontSize: ".82rem", color: COLORS.textFaint, maxWidth: "280px", lineHeight: 1.65 }}>{COURSES_SECTION.description}</p>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: ".6rem" }}>
          {SUBJECTS.map(s => (
            <div key={s.name} className="chip" onClick={handleCTA}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: ".85rem" }}>{s.name}</span>
              <span className="num" style={{ marginLeft: "auto", fontSize: ".72rem", color: COLORS.textFaint }}>{s.topics} тем</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: COLORS.bgSection, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, padding: "4rem 2.5rem" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <p className="section-label">{HOW_SECTION.label}</p>
          <h2 style={{ fontFamily: FONTS.display, fontSize: "1.6rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.02em", marginBottom: "2rem" }}>{HOW_SECTION.title}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: ".75rem" }}>
            {HOW_STEPS.map(s => (
              <div key={s.n} className="step">
                <div className="num" style={{ fontFamily: FONTS.display, fontSize: "2rem", fontWeight: 800, color: "rgba(255,58,58,0.2)", lineHeight: 1, marginBottom: "1rem" }}>{s.n}</div>
                <div style={{ fontFamily: FONTS.display, fontSize: ".95rem", fontWeight: 700, color: COLORS.textPrimary, marginBottom: ".5rem" }}>{s.title}</div>
                <p style={{ fontSize: ".78rem", color: COLORS.textFaint, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXAM CTA — якорь для nav "Экзамен" */}
      <section
        id="exam-cta"
        style={{ maxWidth: "1080px", margin: "0 auto", padding: "5rem 2.5rem", scrollMarginTop: "80px" }}
      >
        <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "2.5rem 3rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          <div style={{ maxWidth: "460px" }}>
            <p className="section-label">{EXAM_CTA.label}</p>
            <h2 style={{ fontFamily: FONTS.display, fontSize: "1.55rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.02em", marginBottom: ".75rem" }}>{EXAM_CTA.title}</h2>
            <p style={{ color: COLORS.textFaint, lineHeight: 1.7, fontSize: ".82rem" }}>{EXAM_CTA.description}</p>
          </div>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: "1.25rem" }}>
              {EXAM_CTA.features.map(f => <span key={f} className="feat-tag">{f}</span>)}
            </div>
            {/* Публичная кнопка — авторизация не нужна */}
            <button className="btn-red" onClick={handleTrialExam}>{EXAM_CTA.btnLabel}</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${COLORS.border}`, padding: "1.4rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ fontFamily: FONTS.display, fontSize: "1rem", fontWeight: 800 }}>
          {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
        </div>
        <p style={{ fontSize: ".72rem", color: COLORS.textGhost }}>
          © {BRAND.year} {BRAND.name}{BRAND.accent}. {FOOTER.copyright}
        </p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {FOOTER.links.map(l => (
            <span key={l.label} className="footer-link" onClick={() => handleAction(l.action)}>
              {l.label}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
