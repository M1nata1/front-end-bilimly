// src/pages/Exam/TrialExamQuestion.tsx
import { COLORS, FONTS, COPY, SUBJECTS, SUBJECT_START, TOTAL_QUESTIONS } from "./trialExam.config";
import type { Question, Subject } from "./trialExam.config";

interface Props {
  q:              Question;
  current:        number;
  chosen:         number | null;
  sub:            Subject;
  onSelectAnswer: (optIdx: number) => void;
  onNext:         () => void;
  onPrev:         () => void;
}

export default function TrialExamQuestion({ q, current, chosen, sub, onSelectAnswer, onNext, onPrev }: Props) {
  const localIdx = current - SUBJECT_START[sub.id];

  return (
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
          Вопрос {localIdx + 1} из {sub.count}
        </span>
        {chosen !== null && (
          <>
            <div style={{ width: "1px", height: "10px", background: COLORS.border }} />
            <span style={{ fontSize: ".7rem", fontWeight: 700, color: COLORS.correctText }}>✓ Отмечен</span>
          </>
        )}
      </div>

      {/* Progress bar внутри предмета */}
      <div style={{ height: "3px", background: "rgba(255,255,255,0.04)", borderRadius: "2px", marginBottom: "1.1rem", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${((localIdx + 1) / sub.count) * 100}%`,
          background: sub.color,
          borderRadius: "2px",
          transition: "width .28s ease",
        }} />
      </div>

      {/* Карточка вопроса */}
      <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: "14px", padding: "1.5rem 1.75rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: "1rem", color: COLORS.textPrimary, lineHeight: 1.72, fontWeight: 600 }}>{q.text}</p>
      </div>

      {/* Варианты ответов */}
      <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", marginBottom: "1.5rem" }}>
        {q.options.map((opt, i) => {
          const isChosen = chosen === i;
          return (
            <div
              key={i}
              className={`opt${isChosen ? " chosen" : ""}`}
              onClick={() => onSelectAnswer(i)}
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
        <button className="btn-ghost" onClick={onPrev} disabled={current === 0}>
          ← {COPY.btnPrev}
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn-red" onClick={onNext}>
          {current === TOTAL_QUESTIONS - 1 ? COPY.btnFinish : `${COPY.btnNext} →`}
        </button>
      </div>
    </div>
  );
}
