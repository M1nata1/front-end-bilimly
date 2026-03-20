// src/pages/FAQ/FaqList.tsx

import { useState } from "react";
import { COLORS, FONTS } from "./faq.config";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="faq-item" onClick={() => setOpen(v => !v)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className={`faq-arrow ${open ? "open" : ""}`} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
      <div className={`faq-answer-wrap ${open ? "open" : ""}`}>
        <div className="faq-answer-inner">
          <p className="faq-a">{a}</p>
        </div>
      </div>
    </div>
  );
}

type Props = {
  items: { q: string; a: string }[];
};

export default function FaqList({ items }: Props) {
  return (
    <section style={{ marginBottom: "5rem" }}>
      <span className="section-label">FAQ</span>
      <h2 style={{ fontFamily: FONTS.display, fontSize: "1.8rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: "2rem" }}>
        Частые вопросы
      </h2>
      <div>
        {items.map((item, i) => (
          <FaqItem key={`${item.q}-${i}`} q={item.q} a={item.a} />
        ))}
      </div>
    </section>
  );
}
