// src/pages/Dashboard/DashboardNav.tsx

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { BRAND, COLORS, FONTS, COPY } from "./dashboard.config";

export default function DashboardNav() {
  const navigate  = useNavigate();
  const user      = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    navigate("/", { replace: true });
  };

  return (
    <nav style={{
      padding: ".9rem 2.5rem",
      background: `${COLORS.bgPage}EC`,
      backdropFilter: "blur(14px)",
      borderBottom: `1px solid ${COLORS.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{ fontFamily: FONTS.display, fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-.01em" }}>
        {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <span className="nav-link" onClick={() => navigate("/courses")}>{COPY.navCourses}</span>
        <span className="nav-link" onClick={() => navigate("/exam")}>{COPY.navExam}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: ".82rem", color: COLORS.textFaint }}>{user?.name}</span>
        <button className="btn-ghost" onClick={handleLogout}>{COPY.btnLogout}</button>
      </div>
    </nav>
  );
}
