// src/pages/Exam/TrialExam.tsx
// Публичный пробный экзамен — только обязательные предметы (ТГО + Английский)
// Доступен без авторизации

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ============================================================
//  КОНФИГУРАЦИЯ
// ============================================================

const BRAND  = { name: "Bilim", accent: "Ly" };
const COLORS = {
  bgPage:      "#0D0D11",
  bgCard:      "#13131A",
  bgSection:   "#0A0A0E",
  border:      "rgba(255,255,255,0.07)",
  accent:      "#FF3A3A",
  accentHover: "#FF5555",
  accentSoft:  "rgba(255,58,58,0.08)",
  accentBorder:"rgba(255,58,58,0.2)",
  correct:     "rgba(34,197,94,0.15)",
  correctBorder:"rgba(34,197,94,0.4)",
  correctText: "#4ADE80",
  wrong:       "rgba(255,58,58,0.1)",
  wrongBorder: "rgba(255,58,58,0.35)",
  textPrimary: "#FAFAFF",
  textBody:    "#F0F0FF",
  textMuted:   "#8888AA",
  textFaint:   "#44445A",
};
const FONTS = {
  display:   "'Syne', sans-serif",
  body:      "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// Длительность пробного экзамена в секундах
// 30 мин ТГО + 30 мин English = 60 мин для демо (реальный — 160 мин)
const TRIAL_DURATION_SEC = 60 * 60; // 60 минут

// --- Обязательные предметы ---
// Только ТГО и Английский язык — профильные НЕ включаются
const TRIAL_SUBJECTS: { id: string; name: string; color: string; count: number }[] = [
  { id: "tgo",     name: "ТГО",              color: "#3A8EFF", count: 30 },
  { id: "english", name: "Английский язык",  color: "#FF3A3A", count: 30 },
];

// Суммарное количество вопросов
const TOTAL_QUESTIONS = TRIAL_SUBJECTS.reduce((acc, s) => acc + s.count, 0);

// --- Тексты ---
const COPY = {
  pageLabel:    "Пробный КТ",
  pageTitle:    "Обязательные предметы",
  pageDesc:     "ТГО и Английский язык · 60 вопросов · 60 минут",
  btnStart:     "Начать экзамен",
  btnFinish:    "Завершить",
  btnNext:      "Следующий вопрос",
  btnBack:      "Предыдущий",
  timerLabel:   "Осталось",
  progressLabel:"Прогресс",
  subjectLabel: "Предмет",
  resultTitle:  "Результат",
  btnRestart:   "Пройти ещё раз",
  btnRegister:  "Зарегистрироваться для полного КТ",
  notePublic:   "Это пробный экзамен с обязательными предметами. Для полного КТ с профильными предметами нужна регистрация.",
};

// --- Mock-вопросы (заглушка до подключения API) ---
// TODO: заменить на fetch к /api/exam/trial/ когда появится эндпоинт
const MOCK_QUESTIONS = [
  // ТГО
  { id: 1, subject: "tgo", text: "Какое государство является непосредственным соседом Казахстана на севере?", options: ["Россия", "Китай", "Киргизия", "Туркменистан"], correct: 0 },
  { id: 2, subject: "tgo", text: "В каком году Казахстан провозгласил независимость?", options: ["1990", "1991", "1992", "1993"], correct: 1 },
  { id: 3, subject: "tgo", text: "Столица Казахстана:", options: ["Алматы", "Шымкент", "Астана", "Актобе"], correct: 2 },
  { id: 4, subject: "tgo", text: "Найдите значение выражения: 15 × 4 − 20 ÷ 5", options: ["52", "56", "60", "48"], correct: 1 },
  { id: 5, subject: "tgo", text: "Если скорость поезда 80 км/ч, за сколько часов он проедет 320 км?", options: ["3", "4", "5", "6"], correct: 1 },
  // Английский
  { id: 6, subject: "english", text: "Choose the correct form: She ___ to school every day.", options: ["go", "goes", "going", "went"], correct: 1 },
  { id: 7, subject: "english", text: "What is the synonym of 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], correct: 2 },
  { id: 8, subject: "english", text: "Fill in the blank: He has ___ finished his homework.", options: ["yet", "still", "already", "just yet"], correct: 2 },
  { id: 9, subject: "english", text: "Choose the correct article: I saw ___ elephant at the zoo.", options: ["a", "an", "the", "—"], correct: 1 },
  { id: 10, subject: "english", text: "What does 'enormous' mean?", options: ["Tiny", "Average", "Very large", "Beautiful"], correct: 2 },
];

// ============================================================
//  ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

const pad2 = (n: number) => String(Math.max(0, n)).padStart(2, "0");
const formatTime = (sec: number) => {
  const s = Math.max(0, sec);
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};

// ============================================================
//  КОМПОНЕНТ
// ============================================================

type Phase = "intro" | "exam" | "result";

export default function TrialExam() {
  const navigate = useNavigate();
  const [phase,     setPhase]     = useState<Phase>("intro");
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<(number | null)[]>(Array(MOCK_QUESTIONS.length).fill(null));
  const [timeLeft,  setTimeLeft]  = useState(TRIAL_DURATION_SEC);
  const timerRef = useRef<number | null>(null);

  // Таймер — запускается только во время экзамена
  useEffect(() => {
    if (phase !== "exam") return;
    const start = Date.now();
    const initial = timeLeft;
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const next = initial - elapsed;
      if (next <= 0) { setTimeLeft(0); finishExam(); }
      else setTimeLeft(next);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const finishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("result");
  };

  const selectAnswer = (idx: number) => {
    if (answers[current] !== null) return; // уже ответили
    setAnswers(prev => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });
  };

  const goNext = () => {
    if (current < MOCK_QUESTIONS.length - 1) setCurrent(c => c + 1);
    else finishExam();
  };
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1); };

  const q       = MOCK_QUESTIONS[current];
  const chosen  = answers[current];
  const score   = answers.filter((a, i) => a === MOCK_QUESTIONS[i].correct).length;
  const pct     = Math.round((score / MOCK_QUESTIONS.length) * 100);
  const subjectOf = (id: string) => TRIAL_SUBJECTS.find(s => s.id === id);
  const answered  = answers.filter(a => a !== null).length;

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}
        .section-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:.6rem;display:block}
        .btn-red{background:${COLORS.accent};color:#fff;border:none;padding:.75rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:700;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-red:hover{background:${COLORS.accentHover};transform:translateY(-1px)}
        .btn-ghost{background:transparent;color:${COLORS.textBody};border:1px solid rgba(255,255,255,.15);padding:.75rem 1.75rem;border-radius:8px;font-family:${FONTS.body};font-weight:600;font-size:.875rem;cursor:pointer;transition:all .18s}
        .btn-ghost:hover{border-color:${COLORS.accent};color:${COLORS.accent}}
        .opt{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:10px;padding:.9rem 1rem;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:.75rem;font-size:.9rem}
        .opt:hover{border-color:rgba(255,58,58,.3)}
        .opt.chosen{border-color:${COLORS.accent};background:${COLORS.accentSoft}}
        .opt.correct{border-color:${COLORS.correctBorder};background:${COLORS.correct};color:${COLORS.correctText}}
        .opt.wrong{border-color:${COLORS.wrongBorder};background:${COLORS.wrong};color:#FF6B6B}
        .num{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum","lnum"}
      `}</style>

      {/* NAV */}
      <nav style={{ padding: ".9rem 2.5rem", background: `${COLORS.bgPage}EC`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-.01em", cursor: "pointer" }} onClick={() => navigate("/")}>
          {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
        </div>
        {phase === "exam" && (
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: ".65rem", fontWeight: 600, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>{COPY.timerLabel}</div>
              <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: "1.2rem", color: timeLeft < 300 ? COLORS.accent : COLORS.textPrimary }}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: ".65rem", fontWeight: 600, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".06em" }}>{COPY.progressLabel}</div>
              <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: "1.2rem", color: COLORS.textPrimary }}>
                {answered}<span style={{ fontWeight: 400, color: COLORS.textFaint, fontSize: ".85rem" }}> / {MOCK_QUESTIONS.length}</span>
              </div>
            </div>
            <button style={{ background: "rgba(255,58,58,0.1)", color: COLORS.accent, border: `1px solid ${COLORS.accentBorder}`, borderRadius: "8px", padding: ".45rem 1rem", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }} onClick={finishExam}>
              {COPY.btnFinish}
            </button>
          </div>
        )}
        {phase !== "exam" && (
          <span style={{ fontSize: ".82rem", color: COLORS.textFaint, cursor: "pointer" }} onClick={() => navigate(-1)}>← Назад</span>
        )}
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "3rem 2.5rem" }}>

        {/* ── INTRO ── */}
        {phase === "intro" && (
          <div>
            <span className="section-label">{COPY.pageLabel}</span>
            <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: ".5rem" }}>
              {COPY.pageTitle}
            </h1>
            <p style={{ fontSize: ".9rem", color: COLORS.textMuted, marginBottom: "2.5rem" }}>{COPY.pageDesc}</p>

            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "1rem" }}>Предметы пробного КТ</div>
              {TRIAL_SUBJECTS.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".65rem" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: ".9rem" }}>{s.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: ".78rem", color: COLORS.textFaint }}>{s.count} вопросов</span>
                </div>
              ))}
            </div>

            <div style={{ background: COLORS.accentSoft, border: `1px solid ${COLORS.accentBorder}`, borderRadius: "10px", padding: ".9rem 1rem", fontSize: ".82rem", color: COLORS.textMuted, lineHeight: 1.6, marginBottom: "2rem" }}>
              {COPY.notePublic}
            </div>

            <button className="btn-red" onClick={() => setPhase("exam")}>{COPY.btnStart}</button>
          </div>
        )}

        {/* ── EXAM ── */}
        {phase === "exam" && (
          <div>
            {/* Прогресс-бар */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", color: COLORS.textFaint, marginBottom: ".4rem" }}>
                <span style={{ color: subjectOf(q.subject)?.color, fontWeight: 700 }}>{subjectOf(q.subject)?.name}</span>
                <span className="num">Вопрос {current + 1} из {MOCK_QUESTIONS.length}</span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((current + 1) / MOCK_QUESTIONS.length) * 100}%`, background: subjectOf(q.subject)?.color ?? COLORS.accent, borderRadius: "2px", transition: "width .3s" }} />
              </div>
            </div>

            {/* Вопрос */}
            <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.75rem", marginBottom: "1.25rem" }}>
              <p style={{ fontSize: "1rem", color: COLORS.textPrimary, lineHeight: 1.65, fontWeight: 600 }}>{q.text}</p>
            </div>

            {/* Варианты */}
            <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", marginBottom: "1.5rem" }}>
              {q.options.map((opt, i) => {
                let cls = "opt";
                if (chosen !== null) {
                  if (i === q.correct) cls += " correct";
                  else if (i === chosen && chosen !== q.correct) cls += " wrong";
                } else if (chosen === i) {
                  cls += " chosen";
                }
                return (
                  <div key={i} className={cls} onClick={() => selectAnswer(i)}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `1.5px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".72rem", fontWeight: 800, color: COLORS.textFaint, flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                  </div>
                );
              })}
            </div>

            {/* Навигация */}
            <div style={{ display: "flex", gap: ".75rem", justifyContent: "space-between" }}>
              <button className="btn-ghost" onClick={goPrev} style={{ opacity: current === 0 ? 0.4 : 1 }} disabled={current === 0}>
                {COPY.btnBack}
              </button>
              <button className="btn-red" onClick={goNext}>
                {current === MOCK_QUESTIONS.length - 1 ? COPY.btnFinish : COPY.btnNext}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && (
          <div style={{ textAlign: "center" }}>
            <span className="section-label" style={{ display: "block", textAlign: "center" }}>{COPY.resultTitle}</span>
            <div style={{ fontFamily: FONTS.display, fontSize: "5rem", fontWeight: 800, color: pct >= 60 ? COLORS.correctText : COLORS.accent, lineHeight: 1, marginBottom: ".5rem" }}>
              {pct}%
            </div>
            <p style={{ fontSize: "1rem", color: COLORS.textMuted, marginBottom: "2.5rem" }}>
              Правильных ответов: {score} из {MOCK_QUESTIONS.length}
            </p>

            {/* Разбивка по предметам */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
              {TRIAL_SUBJECTS.map(s => {
                const qs   = MOCK_QUESTIONS.filter(q => q.subject === s.id);
                const correct = qs.filter((q, idx) => answers[MOCK_QUESTIONS.indexOf(q)] === q.correct).length;
                return (
                  <div key={s.id} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "12px", padding: "1.25rem 1.75rem", minWidth: "160px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, margin: "0 auto .75rem" }} />
                    <div style={{ fontFamily: FONTS.display, fontSize: "1.5rem", fontWeight: 800, color: COLORS.textPrimary }}>{correct}/{qs.length}</div>
                    <div style={{ fontSize: ".72rem", color: COLORS.textFaint, marginTop: ".25rem" }}>{s.name}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: ".75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => { setPhase("intro"); setCurrent(0); setAnswers(Array(MOCK_QUESTIONS.length).fill(null)); setTimeLeft(TRIAL_DURATION_SEC); }}>
                {COPY.btnRestart}
              </button>
              <button className="btn-red" onClick={() => navigate("/auth")}>
                {COPY.btnRegister}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
