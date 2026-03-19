// src/pages/Auth/Auth.tsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================

const BRAND = { name: "Bilim", accent: "Ly", year: "2025" };

// backend: /users/auth/...
const API = {
    baseUrl: "http://localhost:8000", // URL
    login: "/users/auth/login/", //POST
    register: "/users/auth/register/", //POST
    refresh: "/users/auth/token/refresh/", //POST
};

const REDIRECT = { student: "/dashboard", admin: "/admin" };

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
    googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

const RIGHT_SCENE = {
    layout: { minHeightDesktop: "100vh", minHeightMobile: "420px" },
    motion: {
        pulseScale: 0.04,
        shakeDuration: 0.55,
    },
    backgrounds: [
        { width: 520, height: 360, top: "-8%", left: "-6%", color: "rgba(255,58,58,0.12)", blur: 90, duration: 18 },
        { width: 520, height: 360, top: "58%", left: "64%", color: "rgba(58,142,255,0.11)", blur: 96, duration: 24 },
        { width: 460, height: 300, top: "18%", left: "66%", color: "rgba(34,197,94,0.10)", blur: 84, duration: 29 },
    ],
};

type StudyItem = {
    top: string; left: string; rotate: number; scale: number; delay: number; duration: number; fx: number; fy: number; fr: number;
    kind: "chip" | "formula" | "icon"; text?: string; icon?: "sigma" | "atom" | "graph" | "book" | "pi" | "ruler" | "flask";
};

const STUDY_ITEMS: StudyItem[] = [
    { top: "7%", left: "16%", rotate: -12, scale: 1.02, delay: 0.0, duration: 7.1, fx: 14, fy: 18, fr: 4, kind: "formula", text: "E = mc²" },
    { top: "10%", left: "34%", rotate: 7, scale: 0.96, delay: 0.2, duration: 8.6, fx: 10, fy: 14, fr: -3, kind: "chip", text: "тест" },
    { top: "14%", left: "62%", rotate: 12, scale: 0.95, delay: 0.35, duration: 9.2, fx: 12, fy: 20, fr: 5, kind: "icon", icon: "atom" },
    { top: "17%", left: "80%", rotate: -8, scale: 0.92, delay: 0.15, duration: 7.4, fx: 8, fy: 13, fr: -4, kind: "formula", text: "a² + b²" },
    { top: "23%", left: "22%", rotate: 10, scale: 0.98, delay: 0.45, duration: 8.4, fx: 16, fy: 12, fr: 3, kind: "icon", icon: "pi" },
    { top: "26%", left: "44%", rotate: -5, scale: 1.04, delay: 0.25, duration: 7.8, fx: 11, fy: 16, fr: -2, kind: "formula", text: "∫ f(x)dx" },
    { top: "29%", left: "72%", rotate: -10, scale: 1.02, delay: 0.55, duration: 9.6, fx: 13, fy: 18, fr: 6, kind: "chip", text: "таймер" },
    { top: "34%", left: "12%", rotate: 8, scale: 1.0, delay: 0.65, duration: 8.9, fx: 15, fy: 15, fr: 4, kind: "icon", icon: "sigma" },
    { top: "38%", left: "32%", rotate: 14, scale: 0.94, delay: 0.3, duration: 9.9, fx: 11, fy: 20, fr: 5, kind: "chip", text: "шпаргалка" },
    { top: "41%", left: "51%", rotate: -14, scale: 1.08, delay: 0.1, duration: 7.0, fx: 12, fy: 16, fr: -5, kind: "formula", text: "Δ = b² - 4ac" },
    { top: "45%", left: "76%", rotate: 8, scale: 0.98, delay: 0.5, duration: 8.1, fx: 17, fy: 15, fr: 4, kind: "icon", icon: "graph" },
    { top: "51%", left: "18%", rotate: -6, scale: 1.02, delay: 0.75, duration: 9.4, fx: 14, fy: 18, fr: -3, kind: "chip", text: "вопрос 47" },
    { top: "54%", left: "38%", rotate: 11, scale: 0.97, delay: 0.18, duration: 7.6, fx: 10, fy: 13, fr: 2, kind: "icon", icon: "book" },
    { top: "59%", left: "61%", rotate: 9, scale: 1.05, delay: 0.6, duration: 8.8, fx: 15, fy: 12, fr: 5, kind: "formula", text: "sin²x + cos²x = 1" },
    { top: "62%", left: "83%", rotate: -4, scale: 0.94, delay: 0.34, duration: 10.1, fx: 12, fy: 18, fr: -4, kind: "chip", text: "балл" },
    { top: "67%", left: "11%", rotate: 13, scale: 0.95, delay: 0.48, duration: 8.2, fx: 11, fy: 20, fr: 6, kind: "icon", icon: "ruler" },
    { top: "71%", left: "30%", rotate: -9, scale: 1.01, delay: 0.22, duration: 9.3, fx: 18, fy: 14, fr: -3, kind: "formula", text: "logₐb" },
    { top: "74%", left: "49%", rotate: 6, scale: 0.96, delay: 0.7, duration: 7.3, fx: 14, fy: 16, fr: 2, kind: "chip", text: "заметки" },
    { top: "79%", left: "69%", rotate: -7, scale: 1.06, delay: 0.42, duration: 8.7, fx: 13, fy: 18, fr: -5, kind: "formula", text: "P(A|B)" },
    { top: "83%", left: "87%", rotate: 12, scale: 0.92, delay: 0.12, duration: 9.5, fx: 10, fy: 12, fr: 4, kind: "icon", icon: "flask" },
    { top: "86%", left: "21%", rotate: -11, scale: 1.0, delay: 0.58, duration: 8.0, fx: 16, fy: 18, fr: -4, kind: "chip", text: "формулы" },
    { top: "89%", left: "53%", rotate: 5, scale: 0.95, delay: 0.26, duration: 9.0, fx: 11, fy: 17, fr: 3, kind: "formula", text: "x̄ = Σx / n" },
    { top: "91%", left: "76%", rotate: -8, scale: 0.92, delay: 0.68, duration: 10.2, fx: 13, fy: 13, fr: -2, kind: "chip", text: "вариант A" },
];

// ============================================================
// API
// ============================================================
interface LoginResponse { access: string; refresh: string; }
interface ApiError { status?: number; error?: string; detail?: string; message?: string; }

async function postJson<T>(url: string, body: unknown): Promise<T> {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw { status: res.status, ...err } as ApiError;
    }
    return res.json().catch(() => ({} as T));
}

const loginRequest = (email: string, password: string) => postJson<LoginResponse>(`${API.baseUrl}${API.login}`, { email, password });
const registerRequest = (email: string, username: string, password: string, phone_number: string) => postJson<LoginResponse>(`${API.baseUrl}${API.register}`, { email, username, password, phone_number });
export const refreshAccessToken = (refresh: string) => postJson<{ access: string }>(`${API.baseUrl}${API.refresh}`, { refresh });

// ============================================================
// ДЕКОР: "движение жидкости" иконок/формул (правый блок)
// ============================================================

function StudyCloud() {
    const Icon = ({ name }: { name: NonNullable<StudyItem["icon"]> }) => {
        const common = { stroke: "rgba(250,250,255,0.9)", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
        if (name === "sigma") return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M18 5H7l6 7-6 7h11" {...common} /></svg>;
        if (name === "atom") return <svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.8" fill="rgba(255,58,58,0.95)" /><ellipse cx="12" cy="12" rx="9" ry="4" {...common} /><ellipse cx="12" cy="12" rx="4" ry="9" {...common} /><path d="M4.5 7.8c2.5 4.5 12.5 4.5 15 0" {...common} opacity="0.7" /></svg>;
        if (name === "graph") return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 18V6" {...common} /><path d="M4 18h16" {...common} /><path d="M6 15l4-4 3 3 5-6" {...common} /><circle cx="10" cy="11" r="1" fill="rgba(34,197,94,0.95)" /></svg>;
        if (name === "pi") return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M6 8h12" {...common} /><path d="M9 8v9" {...common} /><path d="M15 8v9" {...common} /></svg>;
        if (name === "ruler") return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 16 16 5l3 3L8 19H5z" {...common} /><path d="M13 8l3 3" {...common} opacity="0.7" /><path d="M11 10l3 3" {...common} opacity="0.7" /></svg>;
        if (name === "flask") return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M10 4h4" {...common} /><path d="M11 4v5l-5 8a2 2 0 0 0 1.7 3h8.6A2 2 0 0 0 18 17l-5-8V4" {...common} /><path d="M8.5 15h7" {...common} opacity="0.7" /></svg>;
        return <svg width="26" height="26" viewBox="0 0 24 24"><path d="M7 4h10v16H7z" {...common} /><path d="M9 7h6" {...common} opacity="0.7" /><path d="M9 10h6" {...common} opacity="0.7" /><path d="M9 13h5" {...common} opacity="0.7" /></svg>;
    };

    return (
        <div className="cloud" aria-hidden>
            {RIGHT_SCENE.backgrounds.map((b, i) => (
                <div key={i} className={`cloud-blob cloud-blob-${i + 1}`} style={{ width: b.width, height: b.height, top: b.top, left: b.left, background: b.color, filter: `blur(${b.blur}px)`, animationDuration: `${b.duration}s` }} />
            ))}
            {STUDY_ITEMS.map((it, i) => (
                <div key={i} className={`cloud-item ${it.kind}`} style={{ top: it.top, left: it.left, ["--r" as string]: `${it.rotate}deg`, ["--s" as string]: String(it.scale), ["--fx" as string]: `${it.fx}`, ["--fy" as string]: `${it.fy}`, ["--fr" as string]: `${it.fr}`, animationDelay: `${it.delay}s`, animationDuration: `${it.duration}s` }}>
                    {it.kind === "icon" && it.icon ? <div className="pill pill-icon"><Icon name={it.icon} /></div> : it.kind === "chip" ? <div className="pill pill-chip"><span className="dot" /><span>{it.text}</span></div> : <div className="pill pill-formula">{it.text}</div>}
                </div>
            ))}
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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [regPass, setRegPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [ok, setOk] = useState("");
    const tRef = useRef<number | null>(null);

    const title = useMemo(() => (mode === "register" ? COPY.register.title : mode === "forgot" ? COPY.forgot.title : COPY.login.title), [mode]);
    const subtitle = useMemo(() => (mode === "register" ? COPY.register.subtitle : mode === "forgot" ? COPY.forgot.subtitle : COPY.login.subtitle), [mode]);
    const clearMsgs = () => { setError(""); setOk(""); };
    const mapError = (e: ApiError) => { if (e.status === 429) return COPY.errLimit; if (e.status === 401) return COPY.errInvalid; return e.detail || e.message || COPY.errServer; };
    const pulseError = () => {
        const el = document.querySelector(".cloud");
        el?.classList.remove("bad");
        void (el as HTMLDivElement | null)?.offsetHeight;
        el?.classList.add("bad");
        if (tRef.current) window.clearTimeout(tRef.current);
        tRef.current = window.setTimeout(() => el?.classList.remove("bad"), 650);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        clearMsgs();
        if (mode === "forgot") { setOk(COPY.okForgot); pulseError(); return; }
        if (mode === "login" && (!email.trim() || !password)) { setError(COPY.errEmpty); pulseError(); return; }
        if (mode === "register" && (!regEmail.trim() || !username.trim() || !phone.trim() || !regPass)) { setError(COPY.errEmpty); pulseError(); return; }
        setLoading(true);
        try {
            if (mode === "login") {
                const data = await loginRequest(email.trim(), password);
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
            }
        } catch (err) {
            setError(mapError(err as ApiError));
            pulseError();
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (m: Mode) => { setMode(m); clearMsgs(); };

    return (
        <div className="grid" style={{ background: COLORS.bgPage, fontFamily: FONTS.body, minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 520px) 1fr" }}>
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
        .back{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;color:${COLORS.textFaint};cursor:pointer;user-select:none;width:fit-content}
        .back .arr{display:inline-block;transition:transform .18s,color .18s}
        .back .txt{position:relative;transition:color .18s}
        .back .txt:after{content:"";position:absolute;left:0;bottom:-3px;height:2px;width:0;background:${COLORS.accent};transition:width .18s}
        .back:hover .arr{transform:translateX(-4px);color:${COLORS.accent}}
        .back:hover .txt{color:${COLORS.accent}}
        .back:hover .txt:after{width:100%}
        .cloud{position:relative;width:100%;height:100%;min-height:${RIGHT_SCENE.layout.minHeightDesktop};background:${COLORS.bgRight};overflow:hidden;isolation:isolate}
        .cloud-blob{position:absolute;border-radius:50%;opacity:.82;mix-blend-mode:screen;animation:blobSwim 20s ease-in-out infinite alternate}
        @keyframes blobSwim{0%{transform:translate3d(0,0,0) scale(1)}25%{transform:translate3d(18px,-14px,0) scale(1.04)}50%{transform:translate3d(-12px,16px,0) scale(0.98)}75%{transform:translate3d(10px,8px,0) scale(1.03)}100%{transform:translate3d(-18px,-10px,0) scale(1)}}
        .cloud-item{position:absolute;transform-origin:center;animation:floatLiquid 8s cubic-bezier(.42,.05,.35,1) infinite;will-change:transform,filter}
        @keyframes floatLiquid{0%{transform:translate(-50%,-50%) translate3d(0px,0px,0) rotate(var(--r)) scale(var(--s))}20%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * .55px), calc(var(--fy) * -.40px),0) rotate(calc(var(--r) + var(--fr) * .35deg)) scale(calc(var(--s) + 0.024))}40%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * -.35px), calc(var(--fy) * -.80px),0) rotate(calc(var(--r) + var(--fr) * -.25deg)) scale(calc(var(--s) + 0.04))}60%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * -.60px), calc(var(--fy) * .35px),0) rotate(calc(var(--r) + var(--fr) * .20deg)) scale(calc(var(--s) - 0.014))}80%{transform:translate(-50%,-50%) translate3d(calc(var(--fx) * .38px), calc(var(--fy) * .70px),0) rotate(calc(var(--r) + var(--fr) * -.18deg)) scale(calc(var(--s) + 0.008))}100%{transform:translate(-50%,-50%) translate3d(0px,0px,0) rotate(var(--r)) scale(var(--s))}}
        .pill{display:inline-flex;align-items:center;gap:.55rem;padding:.58rem .82rem;border-radius:999px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 12px 40px rgba(0,0,0,.18)}
        .pill-chip{font-size:.8rem;color:${COLORS.textBody};font-weight:800}
        .pill-formula{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:.86rem;color:rgba(250,250,255,0.92);letter-spacing:-.01em}
        .pill-icon{width:46px;height:46px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:16px;line-height:0}
        .pill-icon svg{display:block;flex:0 0 auto;margin:auto}
        .dot{width:8px;height:8px;border-radius:50%;background:${COLORS.accent};box-shadow:0 0 0 4px rgba(255,58,58,0.14)}
        @keyframes cloudshake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
        .cloud.bad .cloud-item{animation:cloudshake ${RIGHT_SCENE.motion.shakeDuration}s ease-in-out 1 !important}
        @media (max-width:980px){.grid{grid-template-columns:1fr !important}.cloud{min-height:${RIGHT_SCENE.layout.minHeightMobile};height:${RIGHT_SCENE.layout.minHeightMobile}}}
      `}</style>

            <div style={{ background: COLORS.bgLeft, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "2.25rem", display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "1.75rem" }}>
                    <div style={{ fontFamily: FONTS.display, fontSize: "1.15rem", fontWeight: 900, letterSpacing: "-.01em", color: COLORS.textBody, width: "fit-content" }}>
                        {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
                    </div>
                    <div className="back" onClick={() => navigate("/")}><span className="arr">←</span><span className="txt">В главное меню</span></div>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
                    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px" }}>
                        <p style={{ fontSize: ".68rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".6rem" }}>{COPY.label}</p>
                        <h1 style={{ fontFamily: FONTS.display, fontSize: "2rem", fontWeight: 900, color: COLORS.textPrimary, letterSpacing: "-.03em", marginBottom: ".4rem" }}>{title}</h1>
                        <p style={{ fontSize: ".85rem", color: COLORS.textFaint, lineHeight: 1.6, marginBottom: "1.35rem" }}>{subtitle}</p>
                        {error && <div style={{ background: COLORS.errBg, border: `1px solid ${COLORS.errBorder}`, borderRadius: "10px", padding: ".8rem 1rem", fontSize: ".82rem", color: COLORS.errText, marginBottom: "1rem" }}>{error}</div>}
                        {ok && <div style={{ background: COLORS.okBg, border: `1px solid ${COLORS.okBorder}`, borderRadius: "10px", padding: ".8rem 1rem", fontSize: ".82rem", color: COLORS.okText, marginBottom: "1rem" }}>{ok}</div>}

                        {mode === "login" && <>
                            <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.login.labelEmail}</label><input className="inp" type="email" placeholder="user@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                            <div style={{ marginBottom: ".55rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.login.labelPass}</label><div style={{ position: "relative" }}><input className="inp" type={showPass ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: "5.8rem" }} /><button type="button" onClick={() => setShowPass((p2) => !p2)} style={{ position: "absolute", right: ".9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: COLORS.textFaint, fontSize: ".75rem", fontFamily: FONTS.body, fontWeight: 800 }}>{showPass ? "скрыть" : "показать"}</button></div></div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}><span className="link" onClick={() => switchMode("register")}>{COPY.login.toRegister} <b style={{ color: COLORS.accent }}>{COPY.login.toRegisterBtn}</b></span><span className="link" onClick={() => switchMode("forgot")}>{COPY.login.forgot}</span></div>
                            <button className="btn-red" type="submit" disabled={loading}>{loading ? <><div className="spinner" /><span>{COPY.login.btnLoading}</span></> : COPY.login.btnSubmit}</button>
                        </>}

                        {mode === "register" && <>
                            <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.register.labelEmail}</label><input className="inp" type="email" placeholder="user@example.com" autoComplete="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} /></div>
                            <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.register.labelUsername}</label><input className="inp" type="text" placeholder="newuser" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
                            <div style={{ marginBottom: "1rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.register.labelPhone}</label><input className="inp" type="tel" placeholder="87771234567" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                            <div style={{ marginBottom: "1.15rem" }}><label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>{COPY.register.labelPass}</label><div style={{ position: "relative" }}><input className="inp" type={showPass ? "text" : "password"} placeholder="минимум 8 символов" autoComplete="new-password" value={regPass} onChange={(e) => setRegPass(e.target.value)} style={{ paddingRight: "5.8rem" }} /><button type="button" onClick={() => setShowPass((p2) => !p2)} style={{ position: "absolute", right: ".9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: COLORS.textFaint, fontSize: ".75rem", fontFamily: FONTS.body, fontWeight: 800 }}>{showPass ? "скрыть" : "показать"}</button></div></div>
                            <button className="btn-red" type="submit" disabled={loading}>{loading ? <><div className="spinner" /><span>{COPY.register.btnLoading}</span></> : COPY.register.btnSubmit}</button>
                            <div style={{ marginTop: "1rem" }}><span className="link" onClick={() => switchMode("login")}>{COPY.register.toLogin} <b style={{ color: COLORS.accent }}>{COPY.register.toLoginBtn}</b></span></div>
                        </>}

                        {mode === "forgot" && <>
                            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", color: COLORS.textFaint, lineHeight: 1.65, fontSize: ".85rem" }}>{COPY.okForgot}</div>
                            <button className="btn-red" type="submit" disabled={loading}>{COPY.forgot.btnSubmit}</button>
                            <div style={{ marginTop: "1rem" }}><span className="link" onClick={() => switchMode("login")}>{COPY.forgot.back}</span></div>
                        </>}
                    </form>
                </div>
            </div>

            <StudyCloud />
        </div>
    );
}

