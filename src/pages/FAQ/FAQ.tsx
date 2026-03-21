// src/pages/FAQ/FAQ.tsx
// Публичная страница — доступна без авторизации

import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { COLORS, FONTS, FAQ_ITEMS } from "./faq.config";
import FaqNav      from "./FaqNav";
import FaqAbout    from "./FaqAbout";
import FaqList     from "./FaqList";
import FaqContacts from "./FaqContacts";

export default function FAQ() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth   = useAuthStore(s => s.isAuth);

  // Скролл к нужной секции по хэшу из URL
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;
    const t = setTimeout(() => {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [location.hash]);

  const faqItems = FAQ_ITEMS.filter(
    item => item && typeof item.q === "string" && item.q.trim() && typeof item.a === "string" && item.a.trim()
  );

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}
        .section-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:.6rem;display:block}

        .logo-link{font-family:${FONTS.display};font-size:1.28rem;font-weight:800;letter-spacing:-.01em;cursor:pointer;width:fit-content;transition:opacity .18s ease,filter .18s ease,transform .18s ease}
        .logo-link:hover{opacity:.72;filter:brightness(1.04);transform:translateY(-1px)}

        .faq-item{padding:1rem 0;cursor:pointer}
        .faq-q{font-family:${FONTS.display};font-size:.95rem;font-weight:700;color:${COLORS.textPrimary};display:flex;justify-content:space-between;align-items:center;gap:1rem}
        .faq-arrow{color:${COLORS.accent};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:24px;height:24px;transition:transform .24s ease,color .18s ease,opacity .18s ease;opacity:.95}
        .faq-arrow.open{transform:rotate(180deg)}
        .faq-item:hover .faq-arrow{color:${COLORS.accentHover}}
        .faq-answer-wrap{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .26s ease,opacity .22s ease,margin-top .22s ease;margin-top:0}
        .faq-answer-wrap.open{grid-template-rows:1fr;opacity:1;margin-top:.55rem}
        .faq-answer-inner{overflow:hidden}
        .faq-a{font-size:.85rem;color:${COLORS.textMuted};line-height:1.75;max-width:680px;transform:translateY(-6px);transition:transform .26s ease}
        .faq-answer-wrap.open .faq-a{transform:translateY(0)}

        .contact-card{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        a.contact-link{color:${COLORS.accent};text-decoration:none;font-weight:700;font-size:.9rem;transition:color .18s}
        a.contact-link:hover{color:${COLORS.accentHover}}
      `}</style>

      <FaqNav
        isAuth={isAuth}
        onLogoClick={() => navigate("/")}
        onCTA={() => navigate(isAuth ? "/dashboard" : "/auth")}
      />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2.5rem" }}>
        <FaqAbout />

        <div style={{ height: "1px", background: COLORS.border, marginBottom: "4rem" }} />

        <FaqList items={faqItems} />

        <div style={{ height: "1px", background: COLORS.border, marginBottom: "4rem" }} />

        <FaqContacts />
      </div>
    </div>
  );
}
