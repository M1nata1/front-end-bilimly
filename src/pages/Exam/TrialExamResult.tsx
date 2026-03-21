// src/pages/Exam/TrialExamResult.tsx
import { useNavigate } from "react-router-dom";
import { COLORS, FONTS, COPY, SUBJECTS, SUBJECT_START, TOTAL_QUESTIONS, ALL_QUESTIONS } from "./trialExam.config";
import type { SubjectId } from "./trialExam.config";

interface Props {
  answers:       (number | null)[];
  resultTab:     SubjectId;
  onSetResultTab: (id: SubjectId) => void;
  onRestart:     () => void;
}

export default function TrialExamResult({ answers, resultTab, onSetResultTab, onRestart }: Props) {
  const navigate = useNavigate();

  const scoreOf = (id: SubjectId) => {
    const start = SUBJECT_START[id];
    const count = SUBJECTS.find(s => s.id === id)!.count;
    return ALL_QUESTIONS.slice(start, start + count)
      .filter((q, i) => answers[start + i] === q.correct).length;
  };
  const totalScore = SUBJECTS.reduce((sum, s) => sum + scoreOf(s.id), 0);

  const resultSub   = SUBJECTS.find(s => s.id === resultTab)!;
  const resultStart = SUBJECT_START[resultTab];
  const resultQuestions = ALL_QUESTIONS.slice(resultStart, resultStart + resultSub.count)
    .map((q, i) => ({ q, globalIdx: resultStart + i, localIdx: i }));

  return (
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
              onClick={() => onSetResultTab(s.id)}
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
                    const isCorrectOpt  = i === q.correct;
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
        <button className="btn-ghost" onClick={onRestart}>{COPY.btnRestart}</button>
        <button className="btn-red" onClick={() => navigate("/auth")}>{COPY.btnRegister}</button>
      </div>
    </div>
  );
}
