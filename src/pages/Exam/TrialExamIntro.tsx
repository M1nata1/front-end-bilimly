// src/pages/Exam/TrialExamIntro.tsx
import { COLORS, FONTS, COPY, SUBJECTS, TOTAL_QUESTIONS } from "./trialExam.config";

interface Props {
  onStart: () => void;
}

export default function TrialExamIntro({ onStart }: Props) {
  return (
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
          { val: "125",           label: "минут" },
          { val: "80",            label: "макс. баллов" },
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

      <button className="btn-red" style={{ fontSize: ".92rem", padding: ".8rem 2rem" }} onClick={onStart}>
        {COPY.btnStart}
      </button>
    </div>
  );
}
