// src/pages/Dashboard/SubscriptionBadge.tsx

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { API_BASE } from "@/api/auth";
import { COLORS, FONTS, COPY } from "./dashboard.config";
import dayjs from "dayjs";

// ── Типы по Swagger /subscription/me/ ────────────────────────
interface SubscriptionData {
  id:               number;
  tariff:           number;
  tariff_title:     string;
  tariff_days_count:number;
  deadline:         string;   // ISO datetime
  created_at:       string;
  is_active:        boolean;
}

export default function SubscriptionBadge() {
  const accessToken = useAuthStore(s => s.accessToken);
  const [sub,     setSub]     = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }

    fetch(`${API_BASE}/subscription/me/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSub(data))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) return null;

  const isActive = sub?.is_active ?? false;
  const deadline = sub?.deadline ? dayjs(sub.deadline).format("DD.MM.YYYY") : null;

  return (
    <div style={{
      background: isActive ? "rgba(34,197,94,0.06)" : COLORS.bgCard,
      border: `1px solid ${isActive ? "rgba(34,197,94,0.2)" : COLORS.border}`,
      borderRadius: "12px",
      padding: "1rem 1.25rem",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: ".75rem",
      marginBottom: "2rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: isActive ? "#4ade80" : COLORS.textFaint, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: ".82rem", fontWeight: 700, color: isActive ? "#4ade80" : COLORS.textMuted }}>
            {isActive ? COPY.subscription.active : COPY.subscription.inactive}
          </div>
          {isActive && sub && (
            <div style={{ fontSize: ".72rem", color: COLORS.textFaint, marginTop: ".15rem" }}>
              {COPY.subscription.tariff}: {sub.tariff_title} · {COPY.subscription.expires} {deadline}
            </div>
          )}
        </div>
      </div>

      {!isActive && (
        <button style={{ background: COLORS.accent, color: "#fff", border: "none", borderRadius: "6px", padding: ".4rem 1rem", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".78rem", cursor: "pointer" }}>
          {COPY.subscription.btnBuy}
        </button>
      )}
    </div>
  );
}
