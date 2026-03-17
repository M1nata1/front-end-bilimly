// src/pages/Dashboard/Dashboard.tsx

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
//  КОНФИГУРАЦИЯ
// ============================================================

const COPY = {
    greeting:   "Добро пожаловать",
    subtitle:   "Выбери с чего начать сегодня",
    btnCourses: "Перейти к курсам",
    btnExam:    "Пробный экзамен",
    btnLogout:  "Выйти",
    cardCourses: {
        label: "Курсы",
        title: "Изучай темы",
        desc:  "Статьи и мини-тесты по всем предметам КТ",
    },
    cardExam: {
        label: "Экзамен",
        title: "Пробный КТ",
        desc:  "Реальный формат с таймером и разбором ошибок",
    },
};

const COLORS = {
    bgPage:      "#0D0D11",
    bgCard:      "#13131A",
    bgSection:   "#0A0A0E",
    border:      "rgba(255,255,255,0.07)",
    accent:      "#FF3A3A",
    accentHover: "#FF5555",
    accentSoft:  "rgba(255,58,58,0.08)",
    accentBorder:"rgba(255,58,58,0.2)",
    textPrimary: "#FAFAFF",
    textMuted:   "#8888AA",
    textFaint:   "#44445A",
};

const FONTS = {
    display:   "'Syne', sans-serif",
    body:      "'Nunito', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// ============================================================
//  КОД
// ============================================================

export default function Dashboard() {
    const navigate  = useNavigate();
    const user      = useAuthStore(s => s.user);
    const clearAuth = useAuthStore(s => s.clearAuth);

    const handleLogout = () => {
        clearAuth();
        navigate("/", { replace: true });
    };

    return (
        <div style={{ background: COLORS.bgPage, color: COLORS.textPrimary, fontFamily: FONTS.body, minHeight: "100vh" }}>
            <link href={FONTS.googleUrl} rel="stylesheet" />
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .nav-card{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:14px;padding:2rem;cursor:pointer;transition:all .2s;flex:1}
        .nav-card:hover{border-color:rgba(255,58,58,.35);transform:translateY(-3px)}
        .btn-ghost{background:transparent;color:${COLORS.textMuted};border:1px solid ${COLORS.border};padding:.5rem 1.25rem;border-radius:8px;font-family:${FONTS.body};font-weight:600;font-size:.82rem;cursor:pointer;transition:all .18s}
        .btn-ghost:hover{border-color:${COLORS.accent};color:${COLORS.accent}}
      `}</style>

            {/* NAV */}
            <nav style={{ padding: ".9rem 2.5rem", background: `${COLORS.bgPage}EC`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-.01em" }}>
                    КТ<span style={{ color: COLORS.accent }}>Про</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: ".82rem", color: COLORS.textFaint }}>{user?.name}</span>
                    <button className="btn-ghost" onClick={handleLogout}>{COPY.btnLogout}</button>
                </div>
            </nav>

            {/* CONTENT */}
            <main style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem 2.5rem" }}>
                <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
                    {COPY.greeting}
                </p>
                <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 800, letterSpacing: "-.025em", marginBottom: ".5rem" }}>
                    {user?.name ?? "Студент"}
                </h1>
                <p style={{ fontSize: ".9rem", color: COLORS.textMuted, marginBottom: "3rem" }}>{COPY.subtitle}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {/* Courses card */}
                    <div className="nav-card" onClick={() => navigate("/courses")}>
                        <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".75rem" }}>
                            {COPY.cardCourses.label}
                        </p>
                        <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, marginBottom: ".5rem" }}>
                            {COPY.cardCourses.title}
                        </h2>
                        <p style={{ fontSize: ".82rem", color: COLORS.textFaint, lineHeight: 1.65, marginBottom: "1.5rem" }}>
                            {COPY.cardCourses.desc}
                        </p>
                        <span style={{ fontSize: ".8rem", color: COLORS.accent, fontWeight: 700 }}>{COPY.btnCourses} →</span>
                    </div>

                    {/* Exam card */}
                    <div className="nav-card" onClick={() => navigate("/exam")}>
                        <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".75rem" }}>
                            {COPY.cardExam.label}
                        </p>
                        <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, marginBottom: ".5rem" }}>
                            {COPY.cardExam.title}
                        </h2>
                        <p style={{ fontSize: ".82rem", color: COLORS.textFaint, lineHeight: 1.65, marginBottom: "1.5rem" }}>
                            {COPY.cardExam.desc}
                        </p>
                        <span style={{ fontSize: ".8rem", color: COLORS.accent, fontWeight: 700 }}>{COPY.btnExam} →</span>
                    </div>
                </div>
            </main>
        </div>
    );
}