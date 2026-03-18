// src/pages/Auth/Auth.tsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const BRAND = {
    name: "Bilim",
    accent: "Ly",
    year: "2025",
};

// backend: /users/auth/...
const API = {
    baseUrl: "http://localhost:8000", //
    login: "/users/auth/login/", // POST
    register: "/users/auth/register/", // POST
    refresh: "/users/auth/token/refresh/", // POST
    // forgot-password эндпоинта в описании нет — оставил UI-режим без запроса
};

const REDIRECT = {
    student: "/dashboard",
    admin: "/admin",
};

// ============================================================
// ТЕКСТЫ
// ============================================================
const COPY = {
    label: "Добро пожаловать",

    errEmpty: "Заполни все поля",
    errInvalid: "Неверный email или пароль",
    errLimit: "Слишком много попыток. Попробуй позже.",
    errServer: "Ошибка сервера. Попробуй позже.",

    okRegister: "Аккаунт создан. Теперь можно войти.",
    okForgot: "Пока недоступно. Напиши в поддержку, и мы поможем восстановить доступ.",

    login: {
        title: "Войти",
        subtitle: "Email и пароль — и ты внутри.",
        labelEmail: "Email",
        labelPass: "Пароль",
        btnSubmit: "Войти",
        btnLoading: "Входим...",
        forgot: "Забыл пароль?",
        toRegister: "Нет аккаунта?",
        toRegisterBtn: "Регистрация",
    },
    register: {
        title: "Регистрация",
        subtitle: "Создай аккаунт, чтобы сохранялся прогресс.",
        labelEmail: "Email",
        labelUsername: "Имя пользователя",
        labelPhone: "Телефон",
        labelPass: "Пароль",
        btnSubmit: "Создать аккаунт",
        btnLoading: "Создаём...",
        toLogin: "Уже есть аккаунт?",
        toLoginBtn: "Войти",
    },
    forgot: {
        title: "Восстановление",
        subtitle: "Если не помнишь пароль — поможем восстановить доступ.",
        back: "Назад ко входу",
        btnSubmit: "Понятно",
    },
};

// ============================================================
// ДИЗАЙН
// ============================================================
const COLORS = {
    bgPage: "#0D0D11",
    bgLeft: "#0A0A0E",
    bgRight: "#0E0E14",
    bgInput: "#13131A",
    border: "rgba(255,255,255,0.08)",
    borderFocus: "rgba(255,58,58,0.5)",
    accent: "#FF3A3A",
    accentHover: "#FF5555",
    textPrimary: "#FAFAFF",
    textBody: "#F0F0FF",
    textFaint: "#44445A",
    errBg: "rgba(255,58,58,0.08)",
    errBorder: "rgba(255,58,58,0.2)",
    errText: "#FF6B6B",
    okBg: "rgba(34,197,94,0.08)",
    okBorder: "rgba(34,197,94,0.18)",
    okText: "#4ADE80",
};

const FONTS = {
    display: "'Syne', sans-serif",
    body: "'Nunito', sans-serif",
    googleUrl:
        "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// ============================================================
// API
// ============================================================
interface LoginResponse {
    access: string;
    refresh: string;
}

interface ApiError {
    status?: number;
    error?: string;
    detail?: string;
    message?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { status: res.status, ...err } as ApiError;
    }
    return res.json().catch(() => ({} as T));
}

const loginRequest = (email: string, password: string) =>
    postJson<LoginResponse>(`${API.baseUrl}${API.login}`, { email, password });

const registerRequest = (email: string, username: string, password: string, phone_number: string) =>
    postJson<LoginResponse>(`${API.baseUrl}${API.register}`, { email, username, password, phone_number });

// refresh оставил как заготовку
export const refreshAccessToken = (refresh: string) =>
    postJson<{ access: string }>(`${API.baseUrl}${API.refresh}`, { refresh });

// ============================================================
// ДЕКОР: "облако" иконок/формул (правый блок)
// ============================================================
function StudyCloud() {
    const items: Array<{
        top: string;
        left: string;
        rotate: number;
        scale: number;
        delay: number;
        kind: "chip" | "formula" | "icon";
        text?: string;
        icon?: "sigma" | "atom" | "graph" | "book";
    }> = [
        { top: "8%", left: "18%", rotate: -10, scale: 1.0, delay: 0.0, kind: "formula", text: "E = mc²" },
        { top: "14%", left: "62%", rotate: 12, scale: 0.95, delay: 0.2, kind: "icon", icon: "atom" },
        { top: "22%", left: "35%", rotate: 6, scale: 1.05, delay: 0.35, kind: "formula", text: "∫ f(x)dx" },
        { top: "28%", left: "72%", rotate: -8, scale: 1.0, delay: 0.15, kind: "chip", text: "таймер" },
        { top: "34%", left: "14%", rotate: 9, scale: 1.0, delay: 0.55, kind: "icon", icon: "sigma" },
        { top: "40%", left: "48%", rotate: -12, scale: 1.1, delay: 0.1, kind: "formula", text: "Δ = b² - 4ac" },
        { top: "46%", left: "78%", rotate: 8, scale: 0.98, delay: 0.45, kind: "icon", icon: "graph" },
        { top: "52%", left: "24%", rotate: -6, scale: 1.02, delay: 0.25, kind: "chip", text: "вопрос 47" },
        { top: "60%", left: "58%", rotate: 10, scale: 1.05, delay: 0.6, kind: "formula", text: "sin²x + cos²x = 1" },
        { top: "66%", left: "10%", rotate: 14, scale: 0.95, delay: 0.3, kind: "icon", icon: "book" },
        { top: "72%", left: "44%", rotate: -9, scale: 1.0, delay: 0.2, kind: "chip", text: "заметки" },
        { top: "78%", left: "74%", rotate: -5, scale: 1.08, delay: 0.4, kind: "formula", text: "P(A|B)" },
    ];

    const Icon = ({ name }: { name: NonNullable<(typeof items)[number]["icon"]> }) => {
        const common = { stroke: "rgba(250,250,255,0.9)", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
        if (name === "sigma")
            return (
                <svg width="26" height="26" viewBox="0 0 24 24">
                    <path d="M18 5H7l6 7-6 7h11" {...common} />
                </svg>
            );
        if (name === "atom")
            return (
                <svg width="26" height="26" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="1.8" fill="rgba(255,58,58,0.95)" />
                    <ellipse cx="12" cy="12" rx="9" ry="4" {...common} />
                    <ellipse cx="12" cy="12" rx="4" ry="9" {...common} />
                    <path d="M4.5 7.8c2.5 4.5 12.5 4.5 15 0" {...common} opacity="0.7" />
                </svg>
            );
        if (name === "graph")
            return (
                <svg width="26" height="26" viewBox="0 0 24 24">
                    <path d="M4 18V6" {...common} />
                    <path d="M4 18h16" {...common} />
                    <path d="M6 15l4-4 3 3 5-6" {...common} />
                    <circle cx="10" cy="11" r="1" fill="rgba(34,197,94,0.95)" />
                </svg>
            );
        return (
            <svg width="26" height="26" viewBox="0 0 24 24">
                <path d="M7 4h10v16H7z" {...common} />
                <path d="M9 7h6" {...common} opacity="0.7" />
                <path d="M9 10h6" {...common} opacity="0.7" />
                <path d="M9 13h5" {...common} opacity="0.7" />
            </svg>
        );
    };

    return (
        <div className="cloud" aria-hidden>
            <div className="cloud-bg" />
            {items.map((it, i) => (
                <div
                    key={i}
                    className={`cloud-item ${it.kind}`}
                    style={{
                        top: it.top,
                        left: it.left,
                        transform: `translate(-50%, -50%) rotate(${it.rotate}deg) scale(${it.scale})`,
                        animationDelay: `${it.delay}s`,
                    }}
                >
                    {it.kind === "icon" && it.icon ? (
                        <div className="pill pill-icon">
                            <Icon name={it.icon} />
                        </div>
                    ) : it.kind === "chip" ? (
                        <div className="pill pill-chip">
                            <span className="dot" />
                            <span>{it.text}</span>
                        </div>
                    ) : (
                        <div className="pill pill-formula">{it.text}</div>
                    )}
                </div>
            ))}
            <div className="spark s1" />
            <div className="spark s2" />
            <div className="spark s3" />
        </div>
    );
}

// ============================================================
// PAGE
// ============================================================
type Mode = "login" | "register" | "forgot";

export default function Auth() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [mode, setMode] = useState<Mode>("login");

    // login
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // register
    const [regEmail, setRegEmail] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [regPass, setRegPass] = useState("");

    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [ok, setOk] = useState("");

    // реакция для правого декора (двигаем "взгляд" через CSS переменную)
    const [eye, setEye] = useState(0);
    const tRef = useRef<number | null>(null);

    const title = useMemo(() => (mode === "register" ? COPY.register.title : mode === "forgot" ? COPY.forgot.title : COPY.login.title), [mode]);
    const subtitle = useMemo(
        () => (mode === "register" ? COPY.register.subtitle : mode === "forgot" ? COPY.forgot.subtitle : COPY.login.subtitle),
        [mode]
    );

    const clearMsgs = () => {
        setError("");
        setOk("");
    };

    const mapError = (e: ApiError) => {
        if (e.status === 429) return COPY.errLimit;
        if (e.status === 401) return COPY.errInvalid;
        return e.detail || e.message || COPY.errServer;
    };

    const pulseError = () => {
        // дергаем облако (CSS класс)
        const el = document.querySelector(".cloud");
        el?.classList.remove("bad");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (el as any)?.offsetHeight; // force reflow
        el?.classList.add("bad");

        if (tRef.current) window.clearTimeout(tRef.current);
        tRef.current = window.setTimeout(() => el?.classList.remove("bad"), 650);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        clearMsgs();

        if (mode === "forgot") {
            setOk(COPY.okForgot);
            pulseError();
            return;
        }

        if (mode === "login") {
            if (!email.trim() || !password) {
                setError(COPY.errEmpty);
                pulseError();
                return;
            }
        }

        if (mode === "register") {
            if (!regEmail.trim() || !username.trim() || !phone.trim() || !regPass) {
                setError(COPY.errEmpty);
                pulseError();
                return;
            }
        }

        setLoading(true);
        try {
            if (mode === "login") {
                const data = await loginRequest(email.trim(), password);
                // backend не отдаёт user — кладём минимум
                setAuth({ id: "", name: email.trim(), role: "student" }, data.access, data.refresh);
                navigate(REDIRECT.student, { replace: true });
                return;
            }

            if (mode === "register") {
                await registerRequest(regEmail.trim(), username.trim(), regPass, phone.trim());
                setOk(COPY.okRegister);
                setMode("login");
                setEmail(regEmail.trim());
                setPassword("");
                return;
            }
        } catch (err) {
            setError(mapError(err as ApiError));
            pulseError();
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (m: Mode) => {
        setMode(m);
        clearMsgs();
        setEye(0);
    };

    return (
        <div
            className="grid"
            style={{
                background: COLORS.bgPage,
                fontFamily: FONTS.body,
                minHeight: "100vh",
                display: "grid",
                gridTemplateColumns: "minmax(0, 520px) 1fr",
            }}
        >
            <link href={FONTS.googleUrl} rel="stylesheet" />
            <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}
        .inp{width:100%;background:${COLORS.bgInput};border:1px solid ${COLORS.border};border-radius:10px;padding:.8rem 1rem;font-family:${FONTS.body};font-size:.92rem;color:${COLORS.textBody};outline:none;transition:border-color .18s}
        .inp:focus{border-color:${COLORS.borderFocus}}
        .inp::placeholder{color:#33334A}
        .btn-red{width:100%;background:${COLORS.accent};color:#fff;border:none;padding:.85rem;border-radius:10px;font-family:${FONTS.body};font-weight:900;font-size:.92rem;cursor:pointer;transition:all .18s;margin-top:.5rem;display:flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-red:hover:not(:disabled){background:${COLORS.accentHover};transform:translateY(-1px)}
        .btn-red:disabled{opacity:.6;cursor:not-allowed;transform:none}
        .link{font-size:.78rem;color:${COLORS.textFaint};cursor:pointer;transition:color .18s}
        .link:hover{color:${COLORS.accent}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}

        /* back link */
        .back{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;color:${COLORS.textFaint};cursor:pointer;user-select:none}
        .back .arr{display:inline-block;transition:transform .18s,color .18s}
        .back .txt{position:relative;transition:color .18s}
        .back .txt:after{content:"";position:absolute;left:0;bottom:-3px;height:2px;width:0;background:${COLORS.accent};transition:width .18s}
        .back:hover .arr{transform:translateX(-4px);color:${COLORS.accent}}
        .back:hover .txt{color:${COLORS.accent}}
        .back:hover .txt:after{width:100%}

        /* cloud */
        .cloud{--eye:${eye};position:relative;width:100%;height:100%;min-height:100vh;background:${COLORS.bgRight};overflow:hidden}
        .cloud-bg{position:absolute;inset:0;background:
          radial-gradient(520px 340px at 25% 20%, rgba(255,58,58,0.10), transparent 60%),
          radial-gradient(520px 340px at 70% 70%, rgba(58,142,255,0.10), transparent 60%),
          radial-gradient(520px 340px at 70% 25%, rgba(34,197,94,0.08), transparent 60%);
          filter:saturate(1.05)}
        .cloud-item{position:absolute;transform-origin:center;animation:float 6.5s ease-in-out infinite;will-change:transform}
        .cloud-item:nth-child(2n){animation-duration:8.3s}
        .cloud-item:nth-child(3n){animation-duration:7.2s}
        @keyframes float{0%,100%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(var(--s,1)) translateY(0)}50%{transform:translate(-50%,-50%) rotate(var(--r,0deg)) scale(var(--s,1)) translateY(-10px)}}

        .pill{display:inline-flex;align-items:center;gap:.55rem;padding:.55rem .8rem;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(12px)}
        .pill-chip{font-size:.8rem;color:${COLORS.textBody};font-weight:800}
        .pill-formula{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size:.86rem;color:rgba(250,250,255,0.92);letter-spacing:-.01em}
        .pill-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:16px}
        .dot{width:8px;height:8px;border-radius:50%;background:${COLORS.accent};box-shadow:0 0 0 4px rgba(255,58,58,0.14)}

        /* error reaction */
        @keyframes cloudshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        .cloud.bad .cloud-item{animation-name:cloudshake;animation-duration:.55s;animation-iteration-count:1}

        .spark{position:absolute;width:140px;height:140px;border-radius:50%;filter:blur(55px);opacity:.55;mix-blend-mode:screen}
        .spark.s1{background:rgba(255,58,58,0.25);top:-40px;left:-40px}
        .spark.s2{background:rgba(58,142,255,0.22);bottom:-60px;right:-40px}
        .spark.s3{background:rgba(34,197,94,0.18);top:35%;right:-60px}

        @media (max-width: 980px){
          .grid{grid-template-columns:1fr !important}
          .cloud{min-height:360px;height:360px}
        }
      `}</style>

            {/* LEFT: форма */}
            <div
                style={{
                    background: COLORS.bgLeft,
                    borderRight: "1px solid rgba(255,255,255,0.06)",
                    padding: "2.25rem",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ marginBottom: "1.75rem" }}>
                    <div
                        style={{
                            fontFamily: FONTS.display,
                            fontSize: "1.15rem",
                            fontWeight: 900,
                            letterSpacing: "-.01em",
                            color: COLORS.textBody,
                            width: "fit-content",
                        }}
                    >
                        {BRAND.name}
                        <span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
                    </div>

                    {/* стрелка/текст (кликабельно) */}
                    <div className="back" onClick={() => navigate("/")}>
                        <span className="arr">←</span>
                        <span className="txt">В главное меню</span>
                    </div>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px" }}>
                        <p
                            style={{
                                fontSize: ".68rem",
                                fontWeight: 900,
                                letterSpacing: ".12em",
                                textTransform: "uppercase",
                                color: COLORS.accent,
                                marginBottom: ".6rem",
                            }}
                        >
                            {COPY.label}
                        </p>

                        <h1
                            style={{
                                fontFamily: FONTS.display,
                                fontSize: "2rem",
                                fontWeight: 900,
                                color: COLORS.textPrimary,
                                letterSpacing: "-.03em",
                                marginBottom: ".4rem",
                            }}
                        >
                            {title}
                        </h1>

                        <p style={{ fontSize: ".85rem", color: COLORS.textFaint, lineHeight: 1.6, marginBottom: "1.35rem" }}>{subtitle}</p>

                        {error && (
                            <div
                                style={{
                                    background: COLORS.errBg,
                                    border: `1px solid ${COLORS.errBorder}`,
                                    borderRadius: "10px",
                                    padding: ".8rem 1rem",
                                    fontSize: ".82rem",
                                    color: COLORS.errText,
                                    marginBottom: "1rem",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {ok && (
                            <div
                                style={{
                                    background: COLORS.okBg,
                                    border: `1px solid ${COLORS.okBorder}`,
                                    borderRadius: "10px",
                                    padding: ".8rem 1rem",
                                    fontSize: ".82rem",
                                    color: COLORS.okText,
                                    marginBottom: "1rem",
                                }}
                            >
                                {ok}
                            </div>
                        )}

                        {/* LOGIN */}
                        {mode === "login" && (
                            <>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.login.labelEmail}
                                    </label>
                                    <input
                                        className="inp"
                                        type="email"
                                        placeholder="user@example.com"
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onInput={(e) => {
                                            const v = (e.target as HTMLInputElement).value;
                                            setEye(((v.length % 10) - 5) / 5);
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: ".55rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.login.labelPass}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            className="inp"
                                            type={showPass ? "text" : "password"}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setEye(((e.target.value.length % 8) - 4) / 4);
                                            }}
                                            style={{ paddingRight: "5.8rem" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass((p2) => !p2)}
                                            style={{
                                                position: "absolute",
                                                right: ".9rem",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: COLORS.textFaint,
                                                fontSize: ".75rem",
                                                fontFamily: FONTS.body,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {showPass ? "скрыть" : "показать"}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <span className="link" onClick={() => switchMode("register")}>
                    {COPY.login.toRegister} <b style={{ color: COLORS.accent }}>{COPY.login.toRegisterBtn}</b>
                  </span>
                                    <span className="link" onClick={() => switchMode("forgot")}>
                    {COPY.login.forgot}
                  </span>
                                </div>

                                <button className="btn-red" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="spinner" />
                                            <span>{COPY.login.btnLoading}</span>
                                        </>
                                    ) : (
                                        COPY.login.btnSubmit
                                    )}
                                </button>
                            </>
                        )}

                        {/* REGISTER */}
                        {mode === "register" && (
                            <>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.register.labelEmail}
                                    </label>
                                    <input className="inp" type="email" placeholder="user@example.com" autoComplete="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.register.labelUsername}
                                    </label>
                                    <input className="inp" type="text" placeholder="newuser" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.register.labelPhone}
                                    </label>
                                    <input className="inp" type="tel" placeholder="87771234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>

                                <div style={{ marginBottom: "1.15rem" }}>
                                    <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
                                        {COPY.register.labelPass}
                                    </label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            className="inp"
                                            type={showPass ? "text" : "password"}
                                            placeholder="минимум 8 символов"
                                            autoComplete="new-password"
                                            value={regPass}
                                            onChange={(e) => {
                                                setRegPass(e.target.value);
                                                setEye(((e.target.value.length % 8) - 4) / 4);
                                            }}
                                            style={{ paddingRight: "5.8rem" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass((p2) => !p2)}
                                            style={{
                                                position: "absolute",
                                                right: ".9rem",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: COLORS.textFaint,
                                                fontSize: ".75rem",
                                                fontFamily: FONTS.body,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {showPass ? "скрыть" : "показать"}
                                        </button>
                                    </div>
                                </div>

                                <button className="btn-red" type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <div className="spinner" />
                                            <span>{COPY.register.btnLoading}</span>
                                        </>
                                    ) : (
                                        COPY.register.btnSubmit
                                    )}
                                </button>

                                <div style={{ marginTop: "1rem" }}>
                  <span className="link" onClick={() => switchMode("login")}>
                    {COPY.register.toLogin} <b style={{ color: COLORS.accent }}>{COPY.register.toLoginBtn}</b>
                  </span>
                                </div>
                            </>
                        )}

                        {/* FORGOT */}
                        {mode === "forgot" && (
                            <>
                                <div
                                    style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(255,255,255,0.06)",
                                        borderRadius: "12px",
                                        padding: "1rem",
                                        marginBottom: "1rem",
                                        color: COLORS.textFaint,
                                        lineHeight: 1.65,
                                        fontSize: ".85rem",
                                    }}
                                >
                                    {COPY.okForgot}
                                </div>

                                <button className="btn-red" type="submit" disabled={loading}>
                                    {COPY.forgot.btnSubmit}
                                </button>

                                <div style={{ marginTop: "1rem" }}>
                  <span className="link" onClick={() => switchMode("login")}>
                    {COPY.forgot.back}
                  </span>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>

            {/* RIGHT: хаотичные иконки/формулы */}
            <StudyCloud />
        </div>
    );
}
