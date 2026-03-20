// src/pages/Exam/TrialExam.tsx
// Публичный пробный экзамен — ТГО + Английский язык
// Формат: ТГО 30 вопросов 50 мин · Английский 50 вопросов 75 мин · итого 80 / 125 мин
// Доступен без авторизации

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
//  КОНФИГУРАЦИЯ
// ============================================================

const BRAND  = { name: "Bilim", accent: "Ly" };

const COLORS = {
  bgPage:       "#0D0D11",
  bgCard:       "#13131A",
  bgSide:       "#0F0F16",
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

const FONTS = {
  display:   "'Syne', sans-serif",
  body:      "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

type SubjectId = "tgo" | "english";

const SUBJECTS: {
  id: SubjectId; name: string; shortName: string;
  color: string; count: number; durationMin: number; maxScore: number;
}[] = [
  { id: "tgo",     name: "ТГО",             shortName: "ТГО",   color: "#3A8EFF", count: 30, durationMin: 50, maxScore: 30 },
  { id: "english", name: "Английский язык", shortName: "Англ.", color: "#FF3A3A", count: 50, durationMin: 75, maxScore: 50 },
];

// Глобальный индекс первого вопроса каждого предмета
const SUBJECT_START: Record<SubjectId, number> = { tgo: 0, english: 30 };

const TOTAL_QUESTIONS    = SUBJECTS.reduce((s, sub) => s + sub.count, 0); // 80
const TRIAL_DURATION_SEC = 125 * 60; // 7500 сек = 2 ч 05 мин

const COPY = {
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

// ============================================================
//  ВОПРОСЫ
//  TODO: заменить на fetch /api/exam/trial/ при появлении эндпоинта
//  Первые 30 — ТГО, следующие 50 — Английский язык
// ============================================================

type Question = { id: number; subject: SubjectId; text: string; options: string[]; correct: number };

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

const ALL_QUESTIONS: Question[] = [...TGO_MOCK, ...ENGLISH_MOCK];

// ============================================================
//  HELPERS
// ============================================================

const pad2       = (n: number) => String(Math.max(0, n)).padStart(2, "0");
const formatTime = (sec: number) => {
  const s = Math.max(0, sec);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};
const subjectOf = (globalIdx: number): SubjectId =>
  globalIdx < SUBJECT_START.english ? "tgo" : "english";

// ============================================================
//  КОМПОНЕНТ
// ============================================================

type Phase = "intro" | "exam" | "result";

export default function TrialExam() {
  const navigate = useNavigate();

  const [phase,         setPhase]         = useState<Phase>("intro");
  const [current,       setCurrent]       = useState(0);
  const [activeSubject, setActiveSubject] = useState<SubjectId>("tgo");
  const [answers,       setAnswers]       = useState<(number | null)[]>(Array(TOTAL_QUESTIONS).fill(null));
  const [timeLeft,      setTimeLeft]      = useState(TRIAL_DURATION_SEC);
  const [resultTab,     setResultTab]     = useState<SubjectId>("tgo");
  const timerRef = useRef<number | null>(null);

  // Синхронизация таба предмета при навигации Пред/След
  useEffect(() => { setActiveSubject(subjectOf(current)); }, [current]);

  // Таймер — запускается один раз при переходе в фазу exam
  useEffect(() => {
    if (phase !== "exam") return;
    const start   = Date.now();
    const initial = timeLeft;
    timerRef.current = window.setInterval(() => {
      const next = initial - Math.floor((Date.now() - start) / 1000);
      if (next <= 0) { setTimeLeft(0); finishExam(); }
      else             setTimeLeft(next);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("result");
  };

  const restart = () => {
    setPhase("intro");
    setCurrent(0);
    setActiveSubject("tgo");
    setResultTab("tgo");
    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
    setTimeLeft(TRIAL_DURATION_SEC);
  };

  const selectAnswer = (optIdx: number) =>
    setAnswers(prev => { const next = [...prev]; next[current] = optIdx; return next; });

  const goTo   = (idx: number) => setCurrent(idx);
  const goNext = () => { if (current < TOTAL_QUESTIONS - 1) setCurrent(c => c + 1); else finishExam(); };
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1); };

  const switchSubject = (id: SubjectId) => { setActiveSubject(id); setCurrent(SUBJECT_START[id]); };

  // Derived
  const q        = ALL_QUESTIONS[current];
  const chosen   = answers[current];
  const answered = answers.filter(a => a !== null).length;
  const sub      = SUBJECTS.find(s => s.id === q.subject)!;

  const scoreOf = (id: SubjectId) => {
    const start = SUBJECT_START[id];
    const count = SUBJECTS.find(s => s.id === id)!.count;
    return ALL_QUESTIONS.slice(start, start + count)
      .filter((q, i) => answers[start + i] === q.correct).length;
  };
  const totalScore = SUBJECTS.reduce((sum, s) => sum + scoreOf(s.id), 0);

  const resultQuestions = (() => {
    const s = SUBJECTS.find(s => s.id === resultTab)!;
    const start = SUBJECT_START[resultTab];
    return ALL_QUESTIONS.slice(start, start + s.count)
      .map((q, i) => ({ q, globalIdx: start + i, localIdx: i }));
  })();

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}

        .logo-link{display:inline-flex;align-items:center;font-family:${FONTS.display};font-size:1.28rem;font-weight:800;letter-spacing:-.01em;color:${COLORS.textBody};cursor:pointer;width:fit-content;transition:opacity .18s,transform .18s}
        .logo-link:hover{opacity:.72;transform:translateY(-1px)}

        .section-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:.6rem;display:block}

        .btn-red{background:${COLORS.accent};color:#fff;border:none;padding:.7rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:700;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-red:hover{background:${COLORS.accentHover};transform:translateY(-1px)}

        .btn-ghost{background:transparent;color:${COLORS.textBody};border:1px solid rgba(255,255,255,.13);padding:.7rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:600;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-ghost:hover{border-color:${COLORS.accent};color:${COLORS.accent}}
        .btn-ghost:disabled{opacity:.35;pointer-events:none}

        /* Варианты ответов — только выбор, без подсветки правильного */
        .opt{
          background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:10px;
          padding:.85rem 1rem;cursor:pointer;transition:all .18s;
          display:flex;align-items:flex-start;gap:.75rem;font-size:.9rem;line-height:1.55;text-align:left;
          color:${COLORS.textBody};
        }
        .opt:hover:not(.chosen){border-color:rgba(255,58,58,.28);background:rgba(255,58,58,0.04)}
        .opt.chosen{border-color:${COLORS.accent};background:${COLORS.accentSoft}}

        /* Подсветка в результатах */
        .opt.correct{border-color:${COLORS.correctBorder}!important;background:${COLORS.correct}!important;color:${COLORS.correctText}!important}
        .opt.wrong{border-color:${COLORS.wrongBorder}!important;background:${COLORS.wrong}!important;color:#FF6B6B!important}

        /* Навигационная сетка вопросов */
        .q-cell{
          width:34px;height:34px;border-radius:6px;
          display:flex;align-items:center;justify-content:center;
          font-size:.72rem;font-weight:700;cursor:pointer;
          border:1.5px solid rgba(255,255,255,0.06);
          color:${COLORS.textFaint};background:transparent;
          transition:all .14s;font-family:${FONTS.body};
        }
        .q-cell:hover:not(.current){border-color:rgba(255,58,58,.3);color:${COLORS.textMuted}}
        .q-cell.answered{background:rgba(58,142,255,0.12);border-color:rgba(58,142,255,0.32);color:#7BB8FF}
        .q-cell.current{border-color:${COLORS.accent}!important;color:${COLORS.textPrimary}!important;background:${COLORS.accentSoft}!important}

        /* Табы предметов */
        .sub-tab{
          padding:.42rem .9rem;border-radius:7px;font-size:.78rem;font-weight:700;
          cursor:pointer;transition:all .16s;border:1.5px solid transparent;
          font-family:${FONTS.body};color:${COLORS.textFaint};background:transparent;
          flex:1;
        }
        .sub-tab:hover:not(.active){color:${COLORS.textMuted}}

        .num{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum","lnum"}

        /* Таймер — красный при < 5 минут */
        .timer-warn{color:${COLORS.accent}!important;animation:timerPulse 1s ease-in-out infinite}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.65}}
      `}</style>

      {/* ══════════════════════════════════════════════
          HEADER — sticky, всегда сверху
      ══════════════════════════════════════════════ */}
      <nav style={{
        padding: ".7rem 1.75rem",
        background: `${COLORS.bgPage}F2`,
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 200, gap: "1.5rem",
      }}>
        <div className="logo-link" onClick={() => navigate("/")} title="На главную">
          {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
        </div>

        {phase === "exam" && (
          <>
            {/* Центр: таймер + счётчики по предметам */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>

              {/* Таймер */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: ".6rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: ".15rem" }}>
                  {COPY.timerLabel}
                </div>
                <div
                  className={`num${timeLeft < 300 ? " timer-warn" : ""}`}
                  style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: "1.55rem", letterSpacing: "-.01em", color: COLORS.textPrimary }}
                >
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div style={{ width: "1px", height: "36px", background: COLORS.border }} />

              {/* Счётчик по предметам */}
              <div style={{ display: "flex", gap: "1.25rem" }}>
                {SUBJECTS.map(s => {
                  const start = SUBJECT_START[s.id];
                  const cnt   = answers.slice(start, start + s.count).filter(a => a !== null).length;
                  return (
                    <div
                      key={s.id}
                      style={{ textAlign: "center", cursor: "pointer", opacity: activeSubject === s.id ? 1 : 0.55, transition: "opacity .18s" }}
                      onClick={() => switchSubject(s.id)}
                    >
                      <div style={{ fontSize: ".6rem", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: ".15rem" }}>
                        {s.shortName}
                      </div>
                      <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".95rem", color: COLORS.textPrimary }}>
                        {cnt}<span style={{ fontSize: ".75rem", fontWeight: 400, color: COLORS.textFaint }}>/{s.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ width: "1px", height: "36px", background: COLORS.border }} />

              {/* Общий прогресс */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: ".6rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: ".15rem" }}>Всего</div>
                <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".95rem", color: COLORS.textPrimary }}>
                  {answered}<span style={{ fontSize: ".75rem", fontWeight: 400, color: COLORS.textFaint }}>/{TOTAL_QUESTIONS}</span>
                </div>
              </div>
            </div>

            {/* Кнопка завершить */}
            <button
              style={{ background: COLORS.accentSoft, color: COLORS.accent, border: `1px solid ${COLORS.accentBorder}`, borderRadius: "8px", padding: ".45rem 1.1rem", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.accent; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.accentSoft; (e.currentTarget as HTMLButtonElement).style.color = COLORS.accent; }}
              onClick={finishExam}
            >
              {COPY.btnFinish}
            </button>
          </>
        )}

        {phase !== "exam" && <div />}
      </nav>


      {/* ══════════════════════════════════════════════
          INTRO
      ══════════════════════════════════════════════ */}
      {phase === "intro" && (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "4rem 2rem" }}>
          <span className="section-label">{COPY.pageLabel}</span>
          <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: ".5rem" }}>
            {COPY.pageTitle}
          </h1>
          <p style={{ fontSize: ".9rem", color: COLORS.textMuted, marginBottom: "2.5rem", lineHeight: 1.7 }}>
            Обязательные блоки КТ для всех направлений магистратуры
          </p>

          {/* Карточки предметов */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            {SUBJECTS.map(s => (
              <div key={s.id} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", marginBottom: "1rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                  <span style={{ fontSize: ".68rem", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".08em" }}>{s.name}</span>
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: "1.6rem", fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".3rem" }}>вопросов · {s.durationMin} мин · {s.maxScore} баллов</div>
              </div>
            ))}
          </div>

          {/* Итоги */}
          <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.25rem", display: "flex", gap: "2rem", alignItems: "center" }}>
            {[
              { val: TOTAL_QUESTIONS, label: "вопросов" },
              { val: "125", label: "минут" },
              { val: "80",  label: "макс. баллов" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                {i > 0 && <div style={{ width: "1px", height: "28px", background: COLORS.border, marginRight: "-1rem" }} />}
                <div>
                  <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: "1.4rem", color: COLORS.textPrimary }}>{item.val}</div>
                  <div style={{ fontSize: ".68rem", color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".05em", marginTop: ".15rem" }}>{item.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,58,58,0.05)", border: `1px solid ${COLORS.accentBorder}`, borderRadius: "10px", padding: ".85rem 1rem", fontSize: ".82rem", color: COLORS.textMuted, lineHeight: 1.65, marginBottom: "2rem" }}>
            {COPY.notePublic}
          </div>

          <button className="btn-red" style={{ fontSize: ".92rem", padding: ".8rem 2rem" }} onClick={() => setPhase("exam")}>
            {COPY.btnStart}
          </button>
        </div>
      )}


      {/* ══════════════════════════════════════════════
          EXAM — двухколоночный layout
      ══════════════════════════════════════════════ */}
      {phase === "exam" && (
        <div style={{
          maxWidth: "1160px", margin: "0 auto", padding: "1.25rem 1.5rem",
          display: "grid", gridTemplateColumns: "1fr 216px", gap: "1.25rem", alignItems: "start",
        }}>

          {/* ── LEFT: вопрос ── */}
          <div>
            {/* Subject badge + номер */}
            <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sub.color }} />
                <span style={{ fontSize: ".68rem", fontWeight: 700, color: sub.color, textTransform: "uppercase", letterSpacing: ".09em" }}>
                  {sub.name}
                </span>
              </div>
              <div style={{ width: "1px", height: "10px", background: COLORS.border }} />
              <span className="num" style={{ fontSize: ".7rem", color: COLORS.textFaint }}>
                Вопрос {current - SUBJECT_START[sub.id] + 1} из {sub.count}
              </span>
              {chosen !== null && (
                <>
                  <div style={{ width: "1px", height: "10px", background: COLORS.border }} />
                  <span style={{ fontSize: ".7rem", fontWeight: 700, color: COLORS.correctText }}>✓ Отмечен</span>
                </>
              )}
            </div>

            {/* Progress bar (внутри предмета) */}
            <div style={{ height: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", marginBottom: "1.1rem", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${((current - SUBJECT_START[sub.id] + 1) / sub.count) * 100}%`,
                background: sub.color,
                borderRadius: "2px",
                transition: "width .28s ease",
              }} />
            </div>

            {/* Карточка вопроса */}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.5rem 1.75rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "1rem", color: COLORS.textPrimary, lineHeight: 1.72, fontWeight: 600 }}>{q.text}</p>
            </div>

            {/* Варианты — только отметка, без подсветки правильного */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginBottom: "1.5rem" }}>
              {q.options.map((opt, i) => {
                const isChosen = chosen === i;
                return (
                  <div
                    key={i}
                    className={`opt${isChosen ? " chosen" : ""}`}
                    onClick={() => selectAnswer(i)}
                  >
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                      border: `1.5px solid ${isChosen ? COLORS.accent : "rgba(255,255,255,0.1)"}`,
                      background: isChosen ? COLORS.accentSoft : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".7rem", fontWeight: 800,
                      color: isChosen ? COLORS.accent : COLORS.textFaint,
                      transition: "all .15s",
                    }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span style={{ paddingTop: "1px" }}>{opt}</span>
                  </div>
                );
              })}
            </div>

            {/* Навигация */}
            <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
              <button className="btn-ghost" onClick={goPrev} disabled={current === 0}>
                ← {COPY.btnPrev}
              </button>
              <div style={{ flex: 1 }} />
              <button className="btn-red" onClick={goNext}>
                {current === TOTAL_QUESTIONS - 1 ? COPY.btnFinish : `${COPY.btnNext} →`}
              </button>
            </div>
          </div>

          {/* ── RIGHT: сайдбар с навигацией ── */}
          <div style={{ position: "sticky", top: "76px", display: "flex", flexDirection: "column", gap: ".75rem" }}>

            {/* Табы предметов */}
            <div style={{ display: "flex", gap: ".3rem" }}>
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`sub-tab${activeSubject === s.id ? " active" : ""}`}
                  onClick={() => switchSubject(s.id)}
                  style={{
                    borderColor: activeSubject === s.id ? s.color + "40" : "transparent",
                    color: activeSubject === s.id ? s.color : undefined,
                    background: activeSubject === s.id ? s.color + "0D" : undefined,
                  }}
                >
                  {s.shortName}
                </button>
              ))}
            </div>

            {/* Сетка вопросов */}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: ".9rem" }}>
              <div style={{ fontSize: ".62rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: ".7rem" }}>
                {SUBJECTS.find(s => s.id === activeSubject)!.name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "3px" }}>
                {Array.from({ length: SUBJECTS.find(s => s.id === activeSubject)!.count }, (_, i) => {
                  const globalIdx  = SUBJECT_START[activeSubject] + i;
                  const isCurrent  = globalIdx === current;
                  const isAnswered = answers[globalIdx] !== null;
                  return (
                    <button
                      key={i}
                      className={`q-cell${isCurrent ? " current" : isAnswered ? " answered" : ""}`}
                      onClick={() => goTo(globalIdx)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Легенда */}
              <div style={{ marginTop: ".8rem", display: "flex", flexDirection: "column", gap: ".35rem", borderTop: `1px solid ${COLORS.border}`, paddingTop: ".7rem" }}>
                {[
                  { color: "rgba(58,142,255,0.12)", border: "rgba(58,142,255,0.32)", label: "Отмечен" },
                  { color: COLORS.accentSoft,       border: COLORS.accent,           label: "Текущий" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: item.color, border: `1.5px solid ${item.border}`, flexShrink: 0 }} />
                    <span style={{ fontSize: ".65rem", color: COLORS.textFaint }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Итоговый счётчик */}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: ".7rem 1rem", textAlign: "center" }}>
              <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: "1.1rem", color: COLORS.textPrimary }}>
                {answered}
                <span style={{ fontWeight: 400, fontSize: ".75rem", color: COLORS.textFaint }}>/{TOTAL_QUESTIONS}</span>
              </div>
              <div style={{ fontSize: ".62rem", color: COLORS.textFaint, marginTop: ".2rem", textTransform: "uppercase", letterSpacing: ".07em" }}>
                отмечено
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════
          RESULT
      ══════════════════════════════════════════════ */}
      {phase === "result" && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>
          <span className="section-label">{COPY.resultTitle}</span>
          <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.8rem,3.5vw,2.4rem)", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: "2rem" }}>
            Экзамен завершён
          </h1>

          {/* Score summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: ".85rem", marginBottom: "2.5rem" }}>
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.4rem", textAlign: "center" }}>
              <div className="num" style={{ fontFamily: FONTS.display, fontSize: "2.4rem", fontWeight: 800, color: COLORS.textPrimary, lineHeight: 1 }}>{totalScore}</div>
              <div style={{ fontSize: ".7rem", color: COLORS.textFaint, marginTop: ".45rem", textTransform: "uppercase", letterSpacing: ".07em" }}>из {TOTAL_QUESTIONS}</div>
              <div style={{ fontSize: ".72rem", color: COLORS.textMuted, marginTop: ".2rem" }}>вопросов</div>
            </div>
            {SUBJECTS.map(s => {
              const sc  = scoreOf(s.id);
              const pct = Math.round((sc / s.count) * 100);
              return (
                <div key={s.id} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.4rem", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".4rem", marginBottom: ".6rem" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.color }} />
                    <span style={{ fontSize: ".65rem", fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".07em" }}>{s.shortName}</span>
                  </div>
                  <div className="num" style={{ fontFamily: FONTS.display, fontSize: "2rem", fontWeight: 800, color: pct >= 50 ? COLORS.correctText : COLORS.accent, lineHeight: 1 }}>
                    {sc}<span style={{ fontSize: "1.1rem", fontWeight: 400, color: COLORS.textFaint }}>/{s.count}</span>
                  </div>
                  <div style={{ fontSize: ".7rem", color: COLORS.textFaint, marginTop: ".4rem" }}>{pct}% верно</div>
                </div>
              );
            })}
          </div>

          {/* Разбор ответов по предметам */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.25rem" }}>
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  className={`sub-tab${resultTab === s.id ? " active" : ""}`}
                  onClick={() => setResultTab(s.id)}
                  style={{
                    flex: "unset",
                    borderColor: resultTab === s.id ? s.color + "40" : "transparent",
                    color: resultTab === s.id ? s.color : undefined,
                    background: resultTab === s.id ? s.color + "0D" : undefined,
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: ".85rem" }}>
              {resultQuestions.map(({ q, globalIdx, localIdx }) => {
                const userAns    = answers[globalIdx];
                const isAnswered = userAns !== null;
                const isCorrect  = userAns === q.correct;

                return (
                  <div
                    key={q.id}
                    style={{
                      background: COLORS.bgCard,
                      border: `1px solid ${isAnswered ? (isCorrect ? COLORS.correctBorder : COLORS.wrongBorder) : COLORS.border}`,
                      borderRadius: "12px", padding: "1.1rem 1.4rem",
                    }}
                  >
                    {/* Шапка вопроса */}
                    <div style={{ display: "flex", alignItems: "center", gap: ".65rem", marginBottom: ".75rem" }}>
                      <span className="num" style={{ fontSize: ".68rem", fontWeight: 700, color: COLORS.textFaint, minWidth: "20px" }}>
                        {localIdx + 1}
                      </span>
                      {!isAnswered && (
                        <span style={{ fontSize: ".68rem", color: COLORS.textFaint, background: "rgba(255,255,255,0.03)", border: `1px solid ${COLORS.border}`, borderRadius: "5px", padding: ".15rem .55rem" }}>
                          Без ответа
                        </span>
                      )}
                      {isAnswered && isCorrect && (
                        <span style={{ fontSize: ".68rem", fontWeight: 700, color: COLORS.correctText, background: "rgba(34,197,94,0.08)", border: `1px solid ${COLORS.correctBorder}`, borderRadius: "5px", padding: ".15rem .55rem" }}>
                          ✓ Верно
                        </span>
                      )}
                      {isAnswered && !isCorrect && (
                        <span style={{ fontSize: ".68rem", fontWeight: 700, color: "#FF6B6B", background: COLORS.wrong, border: `1px solid ${COLORS.wrongBorder}`, borderRadius: "5px", padding: ".15rem .55rem" }}>
                          ✗ Неверно
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: ".9rem", color: COLORS.textPrimary, lineHeight: 1.65, marginBottom: ".75rem", fontWeight: 600 }}>
                      {q.text}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: ".35rem" }}>
                      {q.options.map((opt, i) => {
                        const isCorrectOpt = i === q.correct;
                        const isWrongChosen = i === userAns && !isCorrectOpt;
                        let bg = "transparent", border = COLORS.border, color = COLORS.textMuted;
                        if (isCorrectOpt)  { bg = COLORS.correct; border = COLORS.correctBorder; color = COLORS.correctText; }
                        if (isWrongChosen) { bg = COLORS.wrong;   border = COLORS.wrongBorder;   color = "#FF6B6B"; }
                        return (
                          <div
                            key={i}
                            style={{ background: bg, border: `1px solid ${border}`, borderRadius: "8px", padding: ".5rem .85rem", fontSize: ".85rem", color, display: "flex", gap: ".55rem", alignItems: "flex-start" }}
                          >
                            <span style={{ fontSize: ".68rem", fontWeight: 800, opacity: .65, flexShrink: 0, marginTop: "1px" }}>{String.fromCharCode(65 + i)}</span>
                            <span style={{ lineHeight: 1.5 }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопки */}
          <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap" }}>
            <button className="btn-ghost" onClick={restart}>{COPY.btnRestart}</button>
            <button className="btn-red" onClick={() => navigate("/auth")}>{COPY.btnRegister}</button>
          </div>
        </div>
      )}
    </div>
  );
}
