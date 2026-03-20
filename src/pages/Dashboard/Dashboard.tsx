// src/pages/Dashboard/Dashboard.tsx

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import DashboardNav      from "./DashboardNav";
import SubscriptionBadge from "./SubscriptionBadge";
import { COLORS, FONTS, COPY } from "./dashboard.config";

export default function Dashboard() {
  const navigate = useNavigate();
  const user     = useAuthStore(s => s.user);

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .nav-link{font-size:.82rem;font-weight:600;color:${COLORS.textMuted};cursor:pointer;transition:color .18s}
        .nav-link:hover{color:${COLORS.accent}}
        .btn-ghost{background:transparent;color:${COLORS.textMuted};border:1px solid ${COLORS.border};padding:.5rem 1.25rem;border-radius:8px;font-family:${FONTS.body};font-weight:600;font-size:.82rem;cursor:pointer;transition:all .18s}
        .btn-ghost:hover{border-color:${COLORS.accent};color:${COLORS.accent}}
        .nav-card{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:14px;padding:2rem;cursor:pointer;transition:all .2s}
        .nav-card:hover{border-color:${COLORS.borderHover};transform:translateY(-3px);background:${COLORS.bgCardHover}}
      `}</style>

      <DashboardNav />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2.5rem" }}>

        <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
          {COPY.greeting}
        </p>
        <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-.025em", color: COLORS.textPrimary, marginBottom: ".5rem" }}>
          {user?.name ?? "Студент"}
        </h1>
        <p style={{ fontSize: ".9rem", color: COLORS.textMuted, marginBottom: "2rem" }}>
          {COPY.subtitle}
        </p>

        <SubscriptionBadge />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {COPY.cards.map(c => (
            <div key={c.key} className="nav-card" onClick={() => navigate(c.href)}>
              <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".75rem" }}>
                {c.label}
              </p>
              <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, color: COLORS.textPrimary, marginBottom: ".5rem" }}>
                {c.title}
              </h2>
              <p style={{ fontSize: ".82rem", color: COLORS.textFaint, lineHeight: 1.65, marginBottom: "1.5rem" }}>
                {c.desc}
              </p>
              <span style={{ fontSize: ".8rem", color: COLORS.accent, fontWeight: 700 }}>
                {c.link} →
              </span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
