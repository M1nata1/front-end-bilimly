import { Dispatch, SetStateAction } from "react";
import { TipTapContent } from "@/components/TipTapRenderer";
import { COLORS, FONTS, ApiQuizData, ApiCheckResult } from "../topicConstants";

interface Props {
  apiQuiz: ApiQuizData | null;
  apiQuizAnswers: Record<number, number[]>;
  setApiQuizAnswers: Dispatch<SetStateAction<Record<number, number[]>>>;
  apiQuizResults: ApiCheckResult[] | null;
  setApiQuizResults: Dispatch<SetStateAction<ApiCheckResult[] | null>>;
  apiQuizChecking: boolean;
  onSubmit: () => void;
}

export default function ApiQuiz({
  apiQuiz, apiQuizAnswers, setApiQuizAnswers,
  apiQuizResults, setApiQuizResults,
  apiQuizChecking, onSubmit,
}: Props) {
  if (!apiQuiz || apiQuiz.questions.length === 0) return null;

  return (
    <div className="fade-up-3" style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: `1px solid ${COLORS.border}` }}>
      <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
        Тест по теме
      </p>
      <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, color: COLORS.textPrimary, marginBottom: "2rem" }}>
        Проверь себя
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {apiQuiz.questions.map((q, qi) => {
          const selected = apiQuizAnswers[q.id] ?? [];
          const result   = apiQuizResults?.find(r => r.question_id === q.id);
          const isDone   = !!apiQuizResults;
          const isMulti  = q.type !== "single";

          const toggleOpt = (oi: number) => {
            if (isDone) return;
            setApiQuizAnswers(prev => {
              const cur = prev[q.id] ?? [];
              if (isMulti) {
                return { ...prev, [q.id]: cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi] };
              }
              return { ...prev, [q.id]: cur.includes(oi) ? [] : [oi] };
            });
          };

          const getOptClass = (oi: number) => {
            let cls = "quiz-opt";
            if (isDone) {
              cls += " quiz-opt--disabled";
              const isCorrect  = result?.correct_answer?.includes(oi) ?? false;
              const isSelected = selected.includes(oi);
              if (isSelected && isCorrect)       cls += " quiz-opt--correct";
              else if (isSelected && !isCorrect) cls += " quiz-opt--wrong";
              else if (!isSelected && isCorrect) cls += " quiz-opt--missed";
            } else if (selected.includes(oi)) {
              cls += " quiz-opt--selected";
            }
            return cls;
          };

          return (
            <div key={q.id}>
              <div style={{ display: "flex", gap: ".6rem", marginBottom: "1rem", alignItems: "baseline" }}>
                <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".75rem", color: COLORS.accent, flexShrink: 0 }}>
                  {String(qi + 1).padStart(2, "0")}
                </span>
                <div style={{ fontSize: ".92rem", fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.55 }}>
                  <TipTapContent content={q.content} />
                </div>
              </div>
              {q.image && (
                <img
                  src={q.image}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "10px", marginBottom: "1rem", display: "block" }}
                />
              )}
              {isMulti && !isDone && (
                <p style={{ fontSize: ".72rem", color: COLORS.textFaint, marginBottom: ".75rem" }}>
                  Выберите все верные варианты
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                {(Array.isArray(q.options) ? q.options : []).map((opt, oi) => (
                  <button key={oi} className={getOptClass(oi)} onClick={() => toggleOpt(oi)}>
                    <span className="quiz-marker">
                      {isDone && (result?.correct_answer?.includes(oi) ? "✓" : selected.includes(oi) ? "✗" : "")}
                    </span>
                    {typeof opt === "string" ? opt : String(opt ?? "")}
                  </button>
                ))}
              </div>
              {isDone && result?.explanation && (
                <p style={{ fontSize: ".78rem", color: COLORS.textMuted, marginTop: ".6rem", paddingLeft: "1rem", borderLeft: `2px solid ${COLORS.border}`, lineHeight: 1.6 }}>
                  💡 {result.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Result */}
      {apiQuizResults && (() => {
        const correct = apiQuizResults.filter(r => r.is_correct).length;
        const total   = apiQuiz.questions.length;
        const perfect = correct === total;
        return (
          <div style={{
            marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "12px",
            background: perfect ? "rgba(34,197,94,0.08)" : "rgba(255,58,58,0.08)",
            border: `1px solid ${perfect ? "rgba(34,197,94,0.2)" : "rgba(255,58,58,0.2)"}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem",
          }}>
            <div>
              <div style={{ fontSize: ".95rem", fontWeight: 700, color: perfect ? "#4ade80" : COLORS.textPrimary }}>
                {perfect ? "Отлично! Все верно." : `${correct} из ${total} правильно`}
              </div>
              <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".2rem" }}>
                {!perfect ? "Перечитай тему и попробуй снова" : "Можно переходить к следующему уроку"}
              </div>
            </div>
            <button
              className="quiz-submit"
              style={{ background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, fontSize: ".8rem", padding: ".5rem 1rem" }}
              onClick={() => { setApiQuizAnswers({}); setApiQuizResults(null); }}
            >
              Пройти снова
            </button>
          </div>
        );
      })()}

      {/* Submit */}
      {!apiQuizResults && (
        <button
          className="quiz-submit"
          style={{ marginTop: "1.5rem" }}
          disabled={apiQuizChecking || Object.keys(apiQuizAnswers).length < apiQuiz.questions.length}
          onClick={onSubmit}
        >
          {apiQuizChecking ? "Проверяем..." : "Проверить ответы"}
        </button>
      )}
    </div>
  );
}
