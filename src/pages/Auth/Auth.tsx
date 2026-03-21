// src/pages/Auth/Auth.tsx

import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import StudyCloud from "./StudyCloud";
import {
  BRAND, API, REDIRECT, COPY, COLORS, FONTS, RIGHT_SCENE,
  sanitizeField, isValidEmail, isValidUsername,
} from "./auth.config";

// ============================================================
//  API HELPERS
// ============================================================

interface LoginResponse { access: string; refresh: string; }
interface ApiError { status?: number; error?: string; detail?: string; message?: string; }

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, ...err } as ApiError;
  }
  return res.json().catch(() => ({} as T));
}

const loginRequest    = (email: string, password: string) =>
    postJson<LoginResponse>(`${API.baseUrl}${API.login}`, { email, password });

const registerRequest = (email: string, username: string, password: string, phone_number: string) =>
    postJson<LoginResponse>(`${API.baseUrl}${API.register}`, { email, username, password, phone_number });

// Экспортируется для использования в api/interceptors при 401
export const refreshAccessToken = (refresh: string) =>
    postJson<{ access: string }>(`${API.baseUrl}${API.refresh}`, { refresh });

// ============================================================
//  TYPES
// ============================================================

type Mode = "login" | "register" | "forgot";

// ============================================================
//  COMPONENT
// ============================================================

export default function Auth() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore(s => s.setAuth);

  const [mode,     setMode]     = useState<Mode>("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone,    setPhone]    = useState("");
  const [regPass,  setRegPass]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [ok,       setOk]       = useState("");
  const tRef = useRef<number | null>(null);

  const title    = useMemo(() => mode === "register" ? COPY.register.title    : mode === "forgot" ? COPY.forgot.title    : COPY.login.title,    [mode]);
  const subtitle = useMemo(() => mode === "register" ? COPY.register.subtitle : mode === "forgot" ? COPY.forgot.subtitle : COPY.login.subtitle, [mode]);

  const clearMsgs = () => { setError(""); setOk(""); };
  const switchMode = (m: Mode) => { setMode(m); clearMsgs(); };

  const mapError = (e: ApiError) => {
    if (e.status === 429) return COPY.errLimit;
    if (e.status === 401) return COPY.errInvalid;
    return e.detail || e.message || COPY.errServer;
  };

  // Shake-анимация на правой панели при ошибке
  const pulseError = () => {
    const el = document.querySelector(".cloud");
    el?.classList.remove("bad");
    void (el as HTMLDivElement | null)?.offsetHeight;
    el?.classList.add("bad");
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(
        () => el?.classList.remove("bad"),
        RIGHT_SCENE.motion.shakeDuration * 1000 + 100,
    );
  };

  // Круговая анимация на правой панели при успехе
  const pulseSuccess = () => {
    const el = document.querySelector(".cloud");
    el?.classList.remove("good");
    void (el as HTMLDivElement | null)?.offsetHeight;
    el?.classList.add("good");
    window.setTimeout(
      () => el?.classList.remove("good"),
      RIGHT_SCENE.motion.successDuration * 1000 + 100,
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearMsgs();

    if (mode === "forgot") { setOk(COPY.okForgot); pulseError(); return; }

    if (mode === "login"    && (!email.trim() || !password))                                          { setError(COPY.errEmpty); pulseError(); return; }
    if (mode === "login"    && !isValidEmail(email))                                                  { setError(COPY.errEmailFormat); pulseError(); return; }
    if (mode === "register" && (!regEmail.trim() || !username.trim() || !phone.trim() || !regPass))   { setError(COPY.errEmpty); pulseError(); return; }
    if (mode === "register" && !isValidEmail(regEmail))                                               { setError(COPY.errEmailFormat); pulseError(); return; }
    if (mode === "register" && !isValidUsername(username))                                            { setError(COPY.errUsername); pulseError(); return; }
    if (mode === "register" && phone.length !== 11)                                                   { setError(COPY.errPhone); pulseError(); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        const data = await loginRequest(email.trim(), password);
        setAuth({ id: "", name: email.trim(), role: "student" }, data.access, data.refresh);
        pulseSuccess();
        navigate(REDIRECT.student, { replace: true });
        return;
      }
      if (mode === "register") {
        await registerRequest(regEmail.trim(), username.trim(), regPass, phone.trim());
        pulseSuccess();
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

  return (
      <div
          className="grid"
          style={{ background: COLORS.bgPage, fontFamily: FONTS.body, minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 520px) 1fr" }}
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

        .logo-link{display:inline-flex;align-items:center;font-family:${FONTS.display};font-size:1.28rem;font-weight:900;letter-spacing:-.01em;color:${COLORS.textBody};cursor:pointer;width:fit-content;transition:opacity .18s ease,filter .18s ease,transform .18s ease}
 .logo-link:hover{opacity:.72;filter:brightness(1.04);transform:translateY(-1px)}
 @keyframes spin{to{transform:rotate(360deg)}}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}

        @media(max-width:980px){
          .grid{grid-template-columns:1fr !important}
        }
      `}</style>

        {/* ── LEFT: форма ── */}
        <div style={{ background: COLORS.bgLeft, borderRight: "1px solid rgba(255,255,255,0.06)", padding: "2.25rem", display: "flex", flexDirection: "column" }}>

          {/* Шапка */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div
                className="logo-link"
                onClick={() => navigate("/")}
                title={COPY.backToMenu}
            >
              {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
            </div>
          </div>

          {/* Форма */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px" }}>

              <p style={{ fontSize: ".68rem", fontWeight: 900, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".6rem" }}>
                {COPY.label}
              </p>
              <h1 style={{ fontFamily: FONTS.display, fontSize: "2rem", fontWeight: 900, color: COLORS.textPrimary, letterSpacing: "-.03em", marginBottom: ".4rem" }}>
                {title}
              </h1>
              <p style={{ fontSize: ".85rem", color: COLORS.textFaint, lineHeight: 1.6, marginBottom: "1.35rem" }}>
                {subtitle}
              </p>

              {error && (
                  <div style={{ background: COLORS.errBg, border: `1px solid ${COLORS.errBorder}`, borderRadius: "10px", padding: ".8rem 1rem", fontSize: ".82rem", color: COLORS.errText, marginBottom: "1rem" }}>
                    {error}
                  </div>
              )}
              {ok && (
                  <div style={{ background: COLORS.okBg, border: `1px solid ${COLORS.okBorder}`, borderRadius: "10px", padding: ".8rem 1rem", fontSize: ".82rem", color: COLORS.okText, marginBottom: "1rem" }}>
                    {ok}
                  </div>
              )}

              {/* ── LOGIN ── */}
              {mode === "login" && (
                  <>
                    <Field label={COPY.login.labelEmail}>
                      <input className="inp" type="email" placeholder="user@example.com" autoComplete="email"
                             value={email} onChange={e => setEmail(sanitizeField(e.target.value))} />
                    </Field>
                    <Field label={COPY.login.labelPass}>
                      <PassInput value={password} onChange={setPassword} show={showPass} toggle={() => setShowPass(p => !p)} />
                    </Field>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                      <span className="link" onClick={() => switchMode("register")}>{COPY.login.toRegister} <b style={{ color: COLORS.accent }}>{COPY.login.toRegisterBtn}</b></span>
                      <span className="link" onClick={() => switchMode("forgot")}>{COPY.login.forgot}</span>
                    </div>
                    <SubmitBtn loading={loading} label={COPY.login.btnSubmit} loadingLabel={COPY.login.btnLoading} />
                  </>
              )}

              {/* ── REGISTER ── */}
              {mode === "register" && (
                  <>
                    <Field label={COPY.register.labelEmail}>
                      <input className="inp" type="email" placeholder="user@example.com" autoComplete="email"
                             value={regEmail} onChange={e => setRegEmail(sanitizeField(e.target.value))} />
                    </Field>
                    <Field label={COPY.register.labelUsername}>
                      <input className="inp" type="text" placeholder="newuser"
                             value={username} onChange={e => setUsername(sanitizeField(e.target.value))} />
                    </Field>
                    <Field label={COPY.register.labelPhone}>
                      <input className="inp" type="tel" placeholder="87771234567"
                             value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))} />
                    </Field>
                    <Field label={COPY.register.labelPass} style={{ marginBottom: "1.15rem" }}>
                      <PassInput value={regPass} onChange={setRegPass} show={showPass} toggle={() => setShowPass(p => !p)} placeholder="минимум 8 символов" newPass />
                    </Field>
                    <SubmitBtn loading={loading} label={COPY.register.btnSubmit} loadingLabel={COPY.register.btnLoading} />
                    <div style={{ marginTop: "1rem" }}>
                      <span className="link" onClick={() => switchMode("login")}>{COPY.register.toLogin} <b style={{ color: COLORS.accent }}>{COPY.register.toLoginBtn}</b></span>
                    </div>
                  </>
              )}

              {/* ── FORGOT ── */}
              {mode === "forgot" && (
                  <>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", color: COLORS.textFaint, lineHeight: 1.65, fontSize: ".85rem" }}>
                      {COPY.okForgot}
                    </div>
                    <SubmitBtn loading={loading} label={COPY.forgot.btnSubmit} loadingLabel={COPY.forgot.btnSubmit} />
                    <div style={{ marginTop: "1rem" }}>
                      <span className="link" onClick={() => switchMode("login")}>{COPY.forgot.back}</span>
                    </div>
                  </>
              )}

            </form>
          </div>
        </div>

        {/* ── RIGHT: анимированная сцена ── */}
        <StudyCloud />
      </div>
  );
}

// ============================================================
//  ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ============================================================

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
      <div style={{ marginBottom: "1rem", ...style }}>
        <label style={{ display: "block", fontSize: ".72rem", fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: COLORS.textFaint, marginBottom: ".5rem" }}>
          {label}
        </label>
        {children}
      </div>
  );
}

function PassInput({ value, onChange, show, toggle, placeholder = "••••••••", newPass = false }: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  toggle: () => void;
  placeholder?: string;
  newPass?: boolean;
}) {
  return (
      <div style={{ position: "relative" }}>
        <input
            className="inp"
            type={show ? "text" : "password"}
            placeholder={placeholder}
            autoComplete={newPass ? "new-password" : "current-password"}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ paddingRight: "5.8rem" }}
        />
        <button
            type="button"
            onClick={toggle}
            style={{ position: "absolute", right: ".9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: COLORS.textFaint, fontSize: ".75rem", fontFamily: FONTS.body, fontWeight: 800 }}
        >
          {show ? "скрыть" : "показать"}
        </button>
      </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
      <button className="btn-red" type="submit" disabled={loading}>
        {loading ? <><div className="spinner" /><span>{loadingLabel}</span></> : label}
      </button>
  );
}
