// src/pages/FAQ/FaqNav.tsx

import { BRAND, COLORS, FONTS } from "./faq.config";

type Props = {
  isAuth:    boolean;
  onLogoClick: () => void;
  onCTA:     () => void;
};

export default function FaqNav({ isAuth, onLogoClick, onCTA }: Props) {
  return (
    <nav style={{ padding: ".9rem 2.5rem", background: `${COLORS.bgPage}EC`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div className="logo-link" onClick={onLogoClick} title="В главное меню">
        {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
      </div>
      <button
        style={{ background: COLORS.accent, color: "#fff", border: "none", padding: ".45rem 1.2rem", borderRadius: "8px", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }}
        onClick={onCTA}
      >
        {isAuth ? "Личный кабинет" : "Войти"}
      </button>
    </nav>
  );
}
