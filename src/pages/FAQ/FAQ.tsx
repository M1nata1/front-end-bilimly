// src/pages/FAQ/FAQ.tsx
// Публичная страница — доступна без авторизации
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

// ============================================================
// КОНФИГУРАЦИЯ
// ============================================================
const BRAND = { name: "Bilim", accent: "Ly" };

const COLORS = {
  bgPage: "#0D0D11",
  bgSection: "#0A0A0E",
  bgCard: "#13131A",
  border: "rgba(255,255,255,0.07)",
  accent: "#FF3A3A",
  accentHover: "#FF5555",
  accentSoft: "rgba(255,58,58,0.08)",
  accentBorder: "rgba(255,58,58,0.2)",
  textPrimary: "#FAFAFF",
  textBody: "#F0F0FF",
  textMuted: "#8888AA",
  textFaint: "#44445A",
};

const FONTS = {
  display: "'Syne', sans-serif",
  body: "'Nunito', sans-serif",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Nunito:wght@400;500;600;700&display=swap",
};

// --- Секция «О платформе» ---
// id="about" — сюда ведёт nav "О платформе" из Landing
const ABOUT = {
  label: "О платформе",
  title: "Что такое BilimLy?",
  body: [
    "BilimLy — образовательная платформа для подготовки к Комплексному тестированию (КТ). Комплексное тестирование — это вступительный экзамен в магистратуру.",
    "Мы собрали структурированные курсы по всем предметам КТ: теория, мини-тесты после каждой темы и реальный формат пробного экзамена.",
    "Платформа создана для помощи будущим магистрантам. Каждый курс строится по принципу Курс → Модуль → Урок, что позволяет двигаться последовательно и не теряться в материале.",
  ],
};

// --- Секция «FAQ» ---
const FAQ_ITEMS = [
  {
    q: "Что такое КТ?",
    a: "Комплексное тестирование (КТ) — обязательный вступительный экзамен для поступления в магистратуру в Казахстане. Состоит из обязательных предметов (ТГО, Английский язык) и профильных дисциплин.",
  },
  {
    q: "Нужна ли регистрация для пробного экзамена?",
    a: "Нет. Пробный экзамен с обязательными предметами (ТГО и Английский язык) доступен без регистрации. Для доступа к профильным предметам и сохранения прогресса нужен аккаунт.",
  },
  {
    q: "Как устроены курсы?",
    a: "Каждый курс состоит из уроков, сгруппированных по темам. Урок — это подробная статья с теорией, примерами и мини-тестом в конце. Прогресс сохраняется автоматически.",
  },
  {
    q: "Сколько вопросов в реальном КТ?",
    a: "В реальном КТ 100 вопросов: 30 по ТГО, 30 по Английскому языку и 40 по профильному предмету. Время — 160 минут.",
  },
  {
    q: "Как добавляются новые вопросы?",
    a: "Контент пополняется нашими методологами. Если хочешь предложить вопрос или нашёл ошибку — напиши нам через форму обратной связи.",
  },
];

// --- Секция «Контакты» ---
// id="contacts" — сюда ведёт footer "Контакты" из Landing
const CONTACTS = {
  label: "Контакты",
  title: "Связаться с нами",
  desc: "Если у тебя есть вопросы, нашёл ошибку или хочешь предложить улучшение — напиши нам.",
  items: [
    { label: "Email", value: "support@bilimly.kz", href: "mailto:support@bilimly.kz" },
    { label: "Telegram", value: "@bilimly_support", href: "https://t.me/bilimly_support" },
  ],
};

// ============================================================
// КОМПОНЕНТ FAQ ITEM
// ============================================================
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
      <div className="faq-item" onClick={() => setOpen((v) => !v)}>
        <div className="faq-q">
          <span>{q}</span>
          <span className={`faq-arrow ${open ? "open" : ""}`} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
          </svg>
        </span>
        </div>

        <div className={`faq-answer-wrap ${open ? "open" : ""}`}>
          <div className="faq-answer-inner">
            <p className="faq-a">{a}</p>
          </div>
        </div>
      </div>
  );
}

// ============================================================
// КОМПОНЕНТ
// ============================================================
export default function FAQ() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = useAuthStore((s) => s.isAuth);

  // Скролл к нужной секции по хэшу из URL
  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const tryScroll = () => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const t = setTimeout(tryScroll, 100);
    return () => clearTimeout(t);
  }, [location.hash]);

  const faqItems = FAQ_ITEMS.filter(
      (item) => item && typeof item.q === "string" && item.q.trim() && typeof item.a === "string" && item.a.trim()
  );

  return (
      <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, minHeight: "100vh" }}>
        <link href={FONTS.googleUrl} rel="stylesheet" />
        <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::selection{background:#FF3A3A30}
        .section-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${COLORS.accent};margin-bottom:.6rem;display:block}

        .logo-link{
          font-family:${FONTS.display};
          font-size:1.28rem;
          font-weight:800;
          letter-spacing:-.01em;
          cursor:pointer;
          width:fit-content;
          transition:opacity .18s ease, filter .18s ease, transform .18s ease;
        }
        .logo-link:hover{
          opacity:.72;
          filter:brightness(1.04);
          transform:translateY(-1px);
        }

        .faq-item{
          padding:1rem 0;
          cursor:pointer;
        }
        .faq-q{
          font-family:${FONTS.display};
          font-size:.95rem;
          font-weight:700;
          color:${COLORS.textPrimary};
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:1rem;
        }
        .faq-arrow{
          color:${COLORS.accent};
          display:inline-flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          width:24px;
          height:24px;
          transition:transform .24s ease, color .18s ease, opacity .18s ease;
          opacity:.95;
        }
        .faq-arrow.open{
          transform:rotate(180deg);
        }
        .faq-item:hover .faq-arrow{
          color:${COLORS.accentHover};
        }

        .faq-answer-wrap{
          display:grid;
          grid-template-rows:0fr;
          opacity:0;
          transition:grid-template-rows .26s ease, opacity .22s ease, margin-top .22s ease;
          margin-top:0;
        }
        .faq-answer-wrap.open{
          grid-template-rows:1fr;
          opacity:1;
          margin-top:.55rem;
        }
        .faq-answer-inner{
          overflow:hidden;
        }
        .faq-a{
          font-size:.85rem;
          color:${COLORS.textMuted};
          line-height:1.75;
          max-width:680px;
          transform:translateY(-6px);
          transition:transform .26s ease;
        }
        .faq-answer-wrap.open .faq-a{transform:translateY(0)}

        .contact-card{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:12px;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
        a.contact-link{color:${COLORS.accent};text-decoration:none;font-weight:700;font-size:.9rem;transition:color .18s}
        a.contact-link:hover{color:${COLORS.accentHover}}
        .stat-card{background:${COLORS.bgCard};border:1px solid ${COLORS.border};border-radius:10px;padding:1rem 1.25rem;text-align:center}
      `}</style>

        {/* NAV */}
        <nav style={{ padding: ".9rem 2.5rem", background: `${COLORS.bgPage}EC`, backdropFilter: "blur(14px)", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div
              className="logo-link"
              onClick={() => navigate("/")}
              title="В главное меню"
          >
            {BRAND.name}<span style={{ color: COLORS.accent }}>{BRAND.accent}</span>
          </div>

          <button
              style={{ background: COLORS.accent, color: "#fff", border: "none", padding: ".45rem 1.2rem", borderRadius: "8px", fontFamily: FONTS.body, fontWeight: 700, fontSize: ".8rem", cursor: "pointer" }}
              onClick={() => navigate(isAuth ? "/dashboard" : "/auth")}
          >
            {isAuth ? "Личный кабинет" : "Войти"}
          </button>
        </nav>

        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2.5rem" }}>
          {/* О ПЛАТФОРМЕ */}
          <section id="about" style={{ marginBottom: "5rem", scrollMarginTop: "90px" }}>
            <span className="section-label">{ABOUT.label}</span>
            <h1 style={{ fontFamily: FONTS.body, fontSize: "1.9rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "0", marginBottom: "1.5rem" }}>
              {ABOUT.title}
            </h1>
            {ABOUT.body.filter((p) => typeof p === "string" && p.trim()).map((p, i) => (
                <p key={i} style={{ fontSize: ".92rem", color: COLORS.textMuted, lineHeight: 1.8, marginBottom: "1rem" }}>{p}</p>
            ))}
          </section>

          <div style={{ height: "1px", background: COLORS.border, marginBottom: "4rem" }} />

          {/* FAQ */}
          <section style={{ marginBottom: "5rem" }}>
            <span className="section-label">FAQ</span>
            <h2 style={{ fontFamily: FONTS.display, fontSize: "1.8rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: "2rem" }}>
              Частые вопросы
            </h2>
            <div>
              {faqItems.map((item, i) => (
                  <FaqItem key={`${item.q}-${i}`} q={item.q} a={item.a} />
              ))}
            </div>
          </section>

          <div style={{ height: "1px", background: COLORS.border, marginBottom: "4rem" }} />

          {/* КОНТАКТЫ */}
          <section id="contacts" style={{ marginBottom: "4rem", scrollMarginTop: "90px" }}>
            <span className="section-label">{CONTACTS.label}</span>
            <h2 style={{ fontFamily: FONTS.display, fontSize: "1.8rem", fontWeight: 800, color: COLORS.textPrimary, letterSpacing: "-.025em", marginBottom: ".75rem" }}>
              {CONTACTS.title}
            </h2>
            <p style={{ fontSize: ".9rem", color: COLORS.textMuted, lineHeight: 1.7, marginBottom: "1.5rem" }}>{CONTACTS.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
              {CONTACTS.items.map((c) => (
                  <div key={c.label} className="contact-card">
                    <span style={{ fontSize: ".75rem", fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: ".08em" }}>{c.label}</span>
                    <a href={c.href} className="contact-link">{c.value}</a>
                  </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  );
}
