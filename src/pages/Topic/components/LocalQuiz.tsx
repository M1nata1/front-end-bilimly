import { Dispatch, SetStateAction } from "react";
import { COLORS, FONTS, QuizQuestion } from "../topicConstants";

interface Props {
  quiz: QuizQuestion[];
  answers: Record<number, number[]>;
  setAnswers: Dispatch<SetStateAction<Record<number, number[]>>>;
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
}

export default function LocalQuiz({ quiz, answers, setAnswers, checked, setChecked }: Props) {
  if (quiz.length === 0) return null;

  return (
    <div style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: `1px solid ${COLORS.border}` }}>
      <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
        Тест по теме
      </p>
      <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, color: COLORS.textPrimary, marginBottom: "2rem" }}>
        Проверь себя
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {quiz.map((q, qi) => {
          const selected = answers[q.id] ?? [];
          const isMultiple = q.type === "multiple";

          const toggle = (oi: number) => {
            if (checked) return;
            setAnswers(prev => {
              const cur = prev[q.id] ?? [];
              if (isMultiple) {
                return { ...prev, [q.id]: cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi] };
              }
              return { ...prev, [q.id]: [oi] };
            });
          };

          const getOptClass = (oi: number) => {
            let cls = "quiz-opt";
            if (checked) {
              cls += " quiz-opt--disabled";
              const isCorrect  = Array.isArray(q.correct) && q.correct.includes(oi);
              const isSelected = selected.includes(oi);
              if (isSelected && isCorrect)       cls += " quiz-opt--correct";
              else if (isSelected && !isCorrect) cls += " quiz-opt--wrong";
              else if (!isSelected && isCorrect) cls += " quiz-opt--missed";
            } else {
              if (selected.includes(oi)) cls += " quiz-opt--selected";
            }
            return cls;
          };

          return (
            <div key={q.id}>
              <div style={{ display: "flex", gap: ".6rem", marginBottom: "1rem", alignItems: "baseline" }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".75rem", color: COLORS.accent, flexShrink: 0 }}>
                  {String(qi + 1).padStart(2, "0")}
                </span>
                <p style={{ fontSize: ".92rem", fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.55 }}>
                  {q.text}
                </p>
              </div>
              {isMultiple && (
                <p style={{ fontSize: ".72rem", color: COLORS.textFaint, marginBottom: ".75rem" }}>
                  Выберите все верные варианты
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {(Array.isArray(q.options) ? q.options : []).map((opt, oi) => (
                  <button key={oi} className={getOptClass(oi)} onClick={() => toggle(oi)}>
                    <span className="quiz-marker">
                      {checked && Array.isArray(q.correct) && q.correct.includes(oi) ? "✓" :
                       checked && selected.includes(oi) && !(Array.isArray(q.correct) && q.correct.includes(oi)) ? "✗" : ""}
                    </span>
                    {typeof opt === "string" ? opt : String(opt ?? "")}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {checked && (() => {
        const score = quiz.filter(q => {
          const sel = answers[q.id] ?? [];
          return sel.length === q.correct.length && q.correct.every(c => sel.includes(c));
        }).length;
        return (
          <div style={{
            marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "12px",
            background: score === quiz.length ? "rgba(34,197,94,0.08)" : "rgba(255,58,58,0.08)",
            border: `1px solid ${score === quiz.length ? "rgba(34,197,94,0.2)" : "rgba(255,58,58,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem",
          }}>
            <div>
              <div style={{ fontSize: ".95rem", fontWeight: 700, color: score === quiz.length ? "#4ade80" : COLORS.textPrimary }}>
                {score === quiz.length ? "Отлично! Все верно." : `${score} из ${quiz.length} правильно`}
              </div>
              <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".2rem" }}>
                {score < quiz.length ? "Перечитай тему и попробуй снова" : "Можно переходить к следующему уроку"}
              </div>
            </div>
            <button
              className="quiz-submit"
              style={{ background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, fontSize: ".8rem", padding: ".5rem 1rem" }}
              onClick={() => { setAnswers({}); setChecked(false); }}
            >
              Пройти снова
            </button>
          </div>
        );
      })()}

      {!checked && (
        <button
          className="quiz-submit"
          style={{ marginTop: "1.5rem" }}
          disabled={Object.keys(answers).length < quiz.length}
          onClick={() => setChecked(true)}
        >
          Проверить ответы
        </button>
      )}
    </div>
  );
}
