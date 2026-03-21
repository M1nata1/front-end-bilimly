// src/pages/Exam/TrialExamSidebar.tsx
import { COLORS, FONTS, SUBJECTS, SUBJECT_START, TOTAL_QUESTIONS } from "./trialExam.config";
import type { SubjectId } from "./trialExam.config";

interface Props {
  answers:         (number | null)[];
  activeSubject:   SubjectId;
  current:         number;
  onSwitchSubject: (id: SubjectId) => void;
  onGoTo:          (globalIdx: number) => void;
}

export default function TrialExamSidebar({ answers, activeSubject, current, onSwitchSubject, onGoTo }: Props) {
  const answered = answers.filter(a => a !== null).length;
  const activeSub = SUBJECTS.find(s => s.id === activeSubject)!;

  return (
    <div style={{ position: "sticky", top: "76px", display: "flex", flexDirection: "column", gap: ".75rem" }}>

      {/* Табы предметов */}
      <div style={{ display: "flex", gap: ".3rem" }}>
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            className={`sub-tab${activeSubject === s.id ? " active" : ""}`}
            onClick={() => onSwitchSubject(s.id)}
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
          {activeSub.name}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "3px" }}>
          {Array.from({ length: activeSub.count }, (_, i) => {
            const globalIdx  = SUBJECT_START[activeSubject] + i;
            const isCurrent  = globalIdx === current;
            const isAnswered = answers[globalIdx] !== null;
            return (
              <button
                key={i}
                className={`q-cell${isCurrent ? " current" : isAnswered ? " answered" : ""}`}
                onClick={() => onGoTo(globalIdx)}
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
  );
}
