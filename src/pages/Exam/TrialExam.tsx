// src/pages/Exam/TrialExam.tsx
// Публичный пробный экзамен — ТГО + Английский язык
// Формат: ТГО 30 вопросов 50 мин · Английский 50 вопросов 75 мин · итого 80 / 125 мин
// Доступен без авторизации

import { useState, useEffect, useRef } from "react";
import {
  COLORS, FONTS, SUBJECTS, SUBJECT_START, TOTAL_QUESTIONS, TRIAL_DURATION_SEC,
  ALL_QUESTIONS, subjectOf,
} from "./trialExam.config";
import type { SubjectId, Phase } from "./trialExam.config";
import TrialExamNav      from "./TrialExamNav";
import TrialExamIntro    from "./TrialExamIntro";
import TrialExamQuestion from "./TrialExamQuestion";
import TrialExamSidebar  from "./TrialExamSidebar";
import TrialExamResult   from "./TrialExamResult";

export default function TrialExam() {
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

  const selectAnswer  = (optIdx: number) =>
    setAnswers(prev => { const next = [...prev]; next[current] = optIdx; return next; });

  const goTo    = (idx: number) => setCurrent(idx);
  const goNext  = () => { if (current < TOTAL_QUESTIONS - 1) setCurrent(c => c + 1); else finishExam(); };
  const goPrev  = () => { if (current > 0) setCurrent(c => c - 1); };
  const switchSubject = (id: SubjectId) => { setActiveSubject(id); setCurrent(SUBJECT_START[id]); };

  const q   = ALL_QUESTIONS[current];
  const sub = SUBJECTS.find(s => s.id === q.subject)!;

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

        .opt{
          background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:10px;
          padding:.85rem 1rem;cursor:pointer;transition:all .18s;
          display:flex;align-items:flex-start;gap:.75rem;font-size:.9rem;line-height:1.55;text-align:left;
          color:${COLORS.textBody};
        }
        .opt:hover:not(.chosen){border-color:rgba(255,58,58,.28);background:rgba(255,58,58,0.04)}
        .opt.chosen{border-color:${COLORS.accent};background:${COLORS.accentSoft}}
        .opt.correct{border-color:${COLORS.correctBorder}!important;background:${COLORS.correct}!important;color:${COLORS.correctText}!important}
        .opt.wrong{border-color:${COLORS.wrongBorder}!important;background:${COLORS.wrong}!important;color:#FF6B6B!important}

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

        .sub-tab{
          padding:.42rem .9rem;border-radius:7px;font-size:.78rem;font-weight:700;
          cursor:pointer;transition:all .16s;border:1.5px solid transparent;
          font-family:${FONTS.body};color:${COLORS.textFaint};background:transparent;
          flex:1;
        }
        .sub-tab:hover:not(.active){color:${COLORS.textMuted}}

        .num{font-variant-numeric:tabular-nums lining-nums;font-feature-settings:"tnum","lnum"}

        .timer-warn{color:${COLORS.accent}!important;animation:timerPulse 1s ease-in-out infinite}
        @keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.65}}
      `}</style>

      <TrialExamNav
        phase={phase}
        timeLeft={timeLeft}
        answers={answers}
        activeSubject={activeSubject}
        onSwitchSubject={switchSubject}
        onFinish={finishExam}
      />

      {phase === "intro" && (
        <TrialExamIntro onStart={() => setPhase("exam")} />
      )}

      {phase === "exam" && (
        <div style={{
          maxWidth: "1160px", margin: "0 auto", padding: "1.25rem 1.5rem",
          display: "grid", gridTemplateColumns: "1fr 216px", gap: "1.25rem", alignItems: "start",
        }}>
          <TrialExamQuestion
            q={q}
            current={current}
            chosen={answers[current]}
            sub={sub}
            onSelectAnswer={selectAnswer}
            onNext={goNext}
            onPrev={goPrev}
          />
          <TrialExamSidebar
            answers={answers}
            activeSubject={activeSubject}
            current={current}
            onSwitchSubject={switchSubject}
            onGoTo={goTo}
          />
        </div>
      )}

      {phase === "result" && (
        <TrialExamResult
          answers={answers}
          resultTab={resultTab}
          onSetResultTab={setResultTab}
          onRestart={restart}
        />
      )}
    </div>
  );
}
