// src/pages/Auth/Auth.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
//  КОНФИГУРАЦИЯ API — когда появится бэкенд, меняй здесь
// ============================================================

const BRAND = {
    name:   "Bilim",
    accent: "Ly",
    year:   "2025",
};

const API = {
    baseUrl: "http://localhost:8000/api",  // ← поменяй на прод URL
    login:   "/auth/login",               // POST
};

/*
  ── ЗАПРОС ───────────────────────────────────────────────────
  POST /api/auth/login
  { "login": "string", "password": "string" }

  ── УСПЕШНЫЙ ОТВЕТ (200) ─────────────────────────────────────
  {
    "accessToken":  "eyJ...",   // JWT, живёт 15–60 мин
    "refreshToken": "eyJ...",   // JWT, живёт 7–30 дней
    "user": {
      "id":   "uuid",
      "name": "Алибек Сейтов",
      "role": "student" | "admin"
    }
  }

  ── ОШИБКИ ───────────────────────────────────────────────────
  401 → { "error": "INVALID_CREDENTIALS" }
  429 → { "error": "TOO_MANY_REQUESTS"   }
  500 → { "error": "SERVER_ERROR"        }

  ── КАК ПЕРЕДАВАТЬ ТОКЕН В ЗАПРОСАХ ──────────────────────────
  Authorization: Bearer <accessToken>
*/

// --- Редиректы после входа ---
const REDIRECT = {
    student: "/dashboard",
    admin:   "/admin",
};

// ============================================================
//  ТЕКСТЫ — меняй здесь
// ============================================================

const COPY = {
    label:        "Добро пожаловать",
    title:        "Войти в аккаунт",
    subtitle:     "Введи логин и пароль, чтобы продолжить подготовку.",
    labelLogin:   "Логин",
    labelPass:    "Пароль",
    btnSubmit:    "Войти",
    btnLoading:   "Входим...",
    forgotPass:   "Забыл пароль?",
    noAccount:    "Нет аккаунта?",
    contactAdmin: "Обратитесь к администратору",
    errEmpty:     "Заполни все поля",
    errInvalid:   "Неверный логин или пароль",
    errLimit:     "Слишком много попыток. Попробуй через 5 минут.",
    errServer:    "Ошибка сервера. Попробуй позже.",
};

const QUOTE = {
    text:   "«Подготовка — это не зубрёжка. Это понимание. Мы помогаем разобраться, а не запомнить.»",
    author: "Команда BilimLy",
};

const SIDE_STATS = [
    { value: "3 000+", label: "вопросов" },
    { value: "94%",    label: "сдают с нами" },
    { value: "12+",    label: "предметов" },
];

// ============================================================
//  ДИЗАЙН
// ============================================================

const COLORS = {
    bgPage:      "#0D0D11",
    bgLeft:      "#0A0A0E",
    bgCard:      "#13131A",
    bgInput:     "#13131A",
    border:      "rgba(255,255,255,0.08)",
    borderFocus: "rgba(255,58,58,0.5)",
    accent:      "#FF3A3A",
    accentHover: "#FF5555",
    textPrimary: "#FAFAFF",
    textBody:    "#F0F0FF",
    textMuted:   "#8888AA",
    textFaint:   "#44445A",
    errBg:       "rgba(255,58,58,0.08)",
    errBorder:   "rgba(255,58,58,0.2)",
    errText:     "#FF6B6B",
};

const FONTS = {
    display:   "'Syne', sans-serif",
    body:      "'Nunito', sans-serif",
    googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// ============================================================
//  КОД — ниже не трогать
// ============================================================

interface LoginResponse {
    accessToken:  string;
    refreshToken: string;
    user: { id: string; name: string; role: "student" | "admin" };
}

interface ApiError {
    status?: number;
    error?:  string;
}

async function loginRequest(login: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API.baseUrl}${API.login}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ login, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { status: res.status, ...err } as ApiError;
    }
    return res.json();
}

export default function Auth() {
    const navigate = useNavigate();
    const setAuth  = useAuthStore(s => s.setAuth);

    const [login,    setLogin]    = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState("");

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        if (!login.trim() || !password) { setError(COPY.errEmpty); return; }
        setLoading(true);
        try {
            const data = await loginRequest(login.trim(), password);
            setAuth(data.user, data.accessToken, data.refreshToken);
            navigate(data.user.role === "admin" ? REDIRECT.admin : REDIRECT.student, { replace: true });
        } catch (err) {
            const e = err as ApiError;
            if (e.status === 429) setError(COPY.errLimit);
            else if (e.status === 401) setError(COPY.errInvalid);
            else setError(COPY.errServer);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: COLORS.bgPage, fontFamily: FONTS.body, minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <link href={FONTS.googleUrl} rel="stylesheet" />
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}
        .inp{width:100%;background:${COLORS.bgInput};border:1px solid ${COLORS.border};border-radius:8px;padding:.75rem 1rem;font-family:${FONTS.body};font-size:.9rem;color:${COLORS.textBody};outline:none;transition:border-color .18s}
        .inp:focus{border-color:${COLORS.borderFocus}}
        .inp::placeholder{color:#33334A}
        .btn-red{width:100%;background:${COLORS.accent};color:#fff;border:none;padding:.8rem;border-radius:8px;font-family:${FONTS.body};font-weight:700;font-size:.9rem;cursor:pointer;transition:all .18s;margin-top:.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-red:hover:not(:disabled){background:${COLORS.accentHover};transform:translateY(-1px)}
        .btn-red:disabled{opacity:.6;cursor:not-allowed;transform:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
      `}</style>

            {/* ── LEFT ── */}
            <div style={{ background: COLORS.bgLeft, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                <div
                    onClick={() => navigate("/")}
                    style={{ fontFamily: FONTS.display, fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-.01em", color: COLORS.textBody, cursor: "pointer", width: "fit-content" }}>
                    {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
                </div>

                <div>
                    <div style={{ background: COLORS.bgCard, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                        <p style={{ fontSize: ".9rem", color: COLORS.textMuted, lineHeight: 1.75, marginBottom: "1rem" }}>{QUOTE.text}</p>
                        <div style={{ fontSize: ".75rem", fontWeight: 700, color: COLORS.textFaint, letterSpacing: ".04em", textTransform: "uppercase" }}>{QUOTE.author}</div>
                    </div>
                    <div style={{ display: "flex", gap: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {SIDE_STATS.map(s => (
                            <div key={s.label}>
                                <div style={{ fontFamily: FONTS.display, fontSize: "1.4rem", fontWeight: 800, color: COLORS.textPrimary }}>{s.value}</div>
                                <div style={{ fontSize: ".68rem", fontWeight: 600, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".06em", marginTop: ".15rem" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "220px", height: "220px", background: "rgba(255,58,58,0.05)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
            </div>

            {/* ── RIGHT ── */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "3rem 2rem" }}>
                <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "380px" }}>

                    <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".6rem" }}>
                        {COPY.label}
                    </p>
                    <h1 style={{ fontFamily: FONTS.display, fontSize: "1.9rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: ".5rem" }}>
                        {COPY.title}
                    </h1>
                    <p style={{ fontSize: ".85rem", color: COLORS.textFaint, marginBottom: "2rem" }}>
                        {COPY.subtitle}
                    </p>

                    {error && (
                        <div style={{ background: COLORS.errBg, border: `1px solid ${COLORS.errBorder}`, borderRadius: "8px", padding: ".75rem 1rem", fontSize: ".82rem", color: COLORS.errText, marginBottom: "1rem" }}>
                            {error}
                        </div>
                    )}

                    {/* Login */}
                    <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                            {COPY.labelLogin}
                        </label>
                        <input className="inp" type="text" placeholder="your_login" autoComplete="username"
                               value={login} onChange={e => setLogin(e.target.value)} />
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: ".5rem" }}>
                        <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                            {COPY.labelPass}
                        </label>
                        <div style={{ position: "relative" }}>
                            <input className="inp" type={showPass ? "text" : "password"} placeholder="••••••••"
                                   autoComplete="current-password" value={password}
                                   onChange={e => setPassword(e.target.value)}
                                   style={{ paddingRight: "5.5rem" }} />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                    style={{ position: "absolute", right: ".9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: COLORS.textFaint, fontSize: ".75rem", fontFamily: FONTS.body, fontWeight: 600 }}>
                                {showPass ? "скрыть" : "показать"}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: ".78rem", color: COLORS.textFaint, cursor: "pointer" }}
                  onMouseOver={e => (e.currentTarget.style.color = COLORS.accent)}
                  onMouseOut={e => (e.currentTarget.style.color = COLORS.textFaint)}>
              {COPY.forgotPass}
            </span>
                    </div>

                    <button className="btn-red" type="submit" disabled={loading}>
                        {loading ? <><div className="spinner" /><span>{COPY.btnLoading}</span></> : COPY.btnSubmit}
                    </button>

                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "1.5rem 0" }} />
                    <p style={{ fontSize: ".78rem", color: COLORS.textFaint, textAlign: "center" }}>
                        {COPY.noAccount}{" "}
                        <span style={{ color: COLORS.accent, cursor: "pointer", fontWeight: 700 }}>{COPY.contactAdmin}</span>
                    </p>
                </form>
            </div>
        </div>
    );
}