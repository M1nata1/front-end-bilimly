// src/pages/FAQ/FaqAbout.tsx

import { COLORS, FONTS, ABOUT } from "./faq.config";

export default function FaqAbout() {
  return (
    <section id="about" style={{ marginBottom: "5rem", scrollMarginTop: "90px" }}>
      <span className="section-label">{ABOUT.label}</span>
      <h1 style={{ fontFamily: FONTS.body, fontSize: "1.9rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "0", marginBottom: "1.5rem" }}>
        {ABOUT.title}
      </h1>
      {ABOUT.body.filter(p => typeof p === "string" && p.trim()).map((p, i) => (
        <p key={i} style={{ fontSize: ".92rem", color: COLORS.textMuted, lineHeight: 1.8, marginBottom: "1rem" }}>{p}</p>
      ))}
    </section>
  );
}
