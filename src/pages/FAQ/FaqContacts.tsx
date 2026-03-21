// src/pages/FAQ/FaqContacts.tsx

import { COLORS, FONTS, CONTACTS } from "./faq.config";

export default function FaqContacts() {
  return (
    <section id="contacts" style={{ marginBottom: "4rem", scrollMarginTop: "90px" }}>
      <span className="section-label">{CONTACTS.label}</span>
      <h2 style={{ fontFamily: FONTS.display, fontSize: "1.8rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: ".75rem" }}>
        {CONTACTS.title}
      </h2>
      <p style={{ fontSize: ".9rem", color: COLORS.textMuted, lineHeight: 1.7, marginBottom: "1.5rem" }}>{CONTACTS.desc}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
        {CONTACTS.items.map(c => (
          <div key={c.label} className="contact-card">
            <span style={{ fontSize: ".75rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</span>
            <a href={c.href} className="contact-link">{c.value}</a>
          </div>
        ))}
      </div>
    </section>
  );
}
