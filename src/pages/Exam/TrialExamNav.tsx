// src/pages/Exam/TrialExamNav.tsx
import { useNavigate } from "react-router-dom";
import { BRAND, COLORS, FONTS, COPY, SUBJECTS, SUBJECT_START, TOTAL_QUESTIONS, formatTime } from "./trialExam.config";
import type { SubjectId, Phase } from "./trialExam.config";

interface Props {
  phase:         Phase;
  timeLeft:      number;
  answers:       (number | null)[];
  activeSubject: SubjectId;
  onSwitchSubject: (id: SubjectId) => void;
  onFinish:      () => void;
}

export default function TrialExamNav({ phase, timeLeft, answers, activeSubject, onSwitchSubject, onFinish }: Props) {
  const navigate = useNavigate();
  const answered = answers.filter(a => a !== null).length;

  return (
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

            {/* Счётчики по предметам */}
            <div style={{ display: "flex", gap: "1.25rem" }}>
              {SUBJECTS.map(s => {
                const start = SUBJECT_START[s.id];
                const cnt   = answers.slice(start, start + s.count).filter(a => a !== null).length;
                return (
                  <div
                    key={s.id}
                    style={{ textAlign: "center", cursor: "pointer", opacity: activeSubject === s.id ? 1 : 0.55, transition: "opacity .18s" }}
                    onClick={() => onSwitchSubject(s.id)}
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
              <div style={{ fontSize: ".6rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".09em", marginBottom: ".15rem" }}>
                Всего
              </div>
              <div className="num" style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".95rem", color: COLORS.textPrimary }}>
                {answered}<span style={{ fontSize: ".75rem", fontWeight: 400, color: COLORS.textFaint }}>/{TOTAL_QUESTIONS}</span>
              </div>
            </div>
          </div>

          <button
            style={{ background: COLORS.accentSoft, color: COLORS.accent, border: `1px solid ${COLORS.accentBorder}`, borderRadius: "8px", padding: ".45rem 1.1rem", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".8rem", cursor: "pointer", transition: "all .18s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { (e.currentTarget).style.background = COLORS.accent; (e.currentTarget).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget).style.background = COLORS.accentSoft; (e.currentTarget).style.color = COLORS.accent; }}
            onClick={onFinish}
          >
            {COPY.btnFinish}
          </button>
        </>
      )}

      {phase !== "exam" && <div />}
    </nav>
  );
}
