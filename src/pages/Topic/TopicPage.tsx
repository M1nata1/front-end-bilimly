import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { EditorContent } from "@tiptap/react";
import DashboardNav from "@/pages/Dashboard/DashboardNav";
import { API_BASE } from "@/api/auth";

import {
  COLORS, FONTS,
  isNumericId, youtubeEmbedUrl,
  ApiLesson, ApiQuizData, ApiCheckResult,
} from "./topicConstants";
import { useTopicContent }   from "./hooks/useTopicContent";
import { useContentSearch }  from "./hooks/useContentSearch";
import { useTipTapEditor }   from "./hooks/useTipTapEditor";
import TopicSidebar          from "./components/TopicSidebar";
import LocalQuiz             from "./components/LocalQuiz";
import ApiQuiz               from "./components/ApiQuiz";
import TopicTOC              from "./components/TopicTOC";

export default function TopicPage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locState          = (location.state as { courseName?: string; categoryName?: string; categoryCode?: string } | null);
  const stateCourseName   = locState?.courseName;
  const stateCategoryName = locState?.categoryName;
  const stateCategoryCode = locState?.categoryCode;

  const useApi = isNumericId(topicId);

  // ── API: уроки ───────────────────────────────────────────────
  const [apiLessons, setApiLessons] = useState<ApiLesson[] | null>(null);
  const [apiLoading, setApiLoading] = useState(useApi);

  useEffect(() => {
    if (!useApi) return;
    setApiLoading(true);
    fetch(`${API_BASE}/courses/${courseId}/lessons/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setApiLessons(data as ApiLesson[]); })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, [courseId, useApi]);

  const apiLesson = useMemo(
    () => apiLessons?.find(l => String(l.id) === topicId) ?? null,
    [apiLessons, topicId],
  );

  // ── API: квиз ────────────────────────────────────────────────
  const accessToken = useAuthStore(s => s.accessToken);
  const [apiQuiz,         setApiQuiz]         = useState<ApiQuizData | null>(null);
  const [apiQuizAnswers,  setApiQuizAnswers]  = useState<Record<number, number[]>>({});
  const [apiQuizResults,  setApiQuizResults]  = useState<ApiCheckResult[] | null>(null);
  const [apiQuizChecking, setApiQuizChecking] = useState(false);

  useEffect(() => {
    if (!useApi || !topicId) return;
    setApiQuiz(null);
    setApiQuizAnswers({});
    setApiQuizResults(null);
    fetch(`${API_BASE}/lessons/${topicId}/quiz/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const quiz = data?.quiz ?? data;
        if (quiz && Array.isArray(quiz.questions)) setApiQuiz(quiz as ApiQuizData);
      })
      .catch(() => {});
  }, [topicId, useApi]);

  const submitApiQuiz = async () => {
    if (!apiQuiz) return;
    setApiQuizChecking(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`${API_BASE}/quizzes/${apiQuiz.id}/check/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          answers: apiQuiz.questions.map(q => ({
            question_id: q.id,
            selected:    apiQuizAnswers[q.id] ?? [],
          })),
        }),
      });
      if (res.ok) setApiQuizResults(await res.json() as ApiCheckResult[]);
    } catch { /* ignore */ }
    setApiQuizChecking(false);
  };

  // ── Хуки ─────────────────────────────────────────────────────
  const { content, videoLink, quiz, answers, setAnswers, checked, setChecked } =
    useTopicContent(topicId, useApi, apiLesson);

  const {
    searchQuery, searchFading, displayedLessons,
    matchCount, matchIndex,
    handleSearch, goNext, goPrev,
    searchInputRef,
  } = useContentSearch(apiLessons, topicId);

  const { editor, tocItems } = useTipTapEditor(content);

  // ── TOC: активный заголовок по скроллу ───────────────────────
  const mainScrollRef  = useRef<HTMLDivElement>(null);
  const suppressScroll = useRef(false);
  const suppressTimer  = useRef<ReturnType<typeof setTimeout>>();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!tocItems.length) return;
    const OFFSET = 90;

    const onScroll = () => {
      if (suppressScroll.current) return;
      const pm = document.querySelector(".tiptap-content .ProseMirror");
      if (!pm) return;
      const headings = Array.from(pm.querySelectorAll("h1,h2,h3,h4"));
      if (!headings.length) return;
      let activeIdx = 0;
      headings.forEach((el, i) => {
        if (el.getBoundingClientRect().top <= OFFSET) activeIdx = i;
      });
      if (tocItems[activeIdx]) setActiveId(tocItems[activeIdx].id);
    };

    const container = mainScrollRef.current;
    if (!container) return;
    const raf = requestAnimationFrame(() => {
      onScroll();
      container.addEventListener("scroll", onScroll, { passive: true });
    });
    return () => { cancelAnimationFrame(raf); container.removeEventListener("scroll", onScroll); };
  }, [tocItems]);

  // ── Навигация prev/next ───────────────────────────────────────
  const allLessons = useMemo(
    () => apiLessons?.map(l => ({ id: String(l.id), title: l.title })) ?? [],
    [apiLessons],
  );
  const currentIdx = allLessons.findIndex(l => l.id === topicId);

  const filteredTocItems = useMemo(() => {
    if (!searchQuery.trim()) return tocItems;
    const q = searchQuery.toLowerCase();
    return tocItems.filter(item => item.text.toLowerCase().includes(q));
  }, [tocItems, searchQuery]);

  const lessonTitle = apiLesson?.title ?? (apiLoading ? "Загрузка..." : "Урок не найден");
  const moduleLabel = apiLesson?.course_name ?? stateCourseName ?? "";

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, height: "100vh", overflow: "hidden" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}

        .topic-layout{display:grid;grid-template-columns:300px 1fr 260px;height:calc(100vh - 57px);overflow:hidden}
        .topic-sidebar{
          height:100%;overflow-y:auto;background:${COLORS.bgSidebar};
          border-right:1px solid ${COLORS.border};padding:1.25rem 0;
        }
        .topic-main-scroll{height:100%;overflow-y:auto}

        .topic-sidebar,.topic-main-scroll,.topic-toc{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.08) transparent}
        .topic-sidebar::-webkit-scrollbar,.topic-main-scroll::-webkit-scrollbar,.topic-toc::-webkit-scrollbar{width:4px}
        .topic-sidebar::-webkit-scrollbar-track,.topic-main-scroll::-webkit-scrollbar-track,.topic-toc::-webkit-scrollbar-track{background:transparent}
        .topic-sidebar::-webkit-scrollbar-thumb,.topic-main-scroll::-webkit-scrollbar-thumb,.topic-toc::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:99px}
        .topic-sidebar::-webkit-scrollbar-thumb:hover,.topic-main-scroll::-webkit-scrollbar-thumb:hover,.topic-toc::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.16)}
        .sidebar-mod{padding:.5rem 1.25rem .25rem;font-size:.62rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${COLORS.textFaint}}
        .sidebar-lesson{
          display:flex;align-items:center;gap:.6rem;
          padding:.55rem 1.25rem;font-size:.82rem;font-weight:600;
          color:${COLORS.textMuted};cursor:pointer;transition:all .15s;
          border-left:2px solid transparent;
        }
        .sidebar-lesson:hover{color:${COLORS.textBody};background:rgba(255,255,255,0.03)}
        .sidebar-lesson.active{color:${COLORS.accent};border-left-color:${COLORS.accent};background:rgba(255,58,58,0.05)}

        .topic-main{padding:2.5rem 2.5rem;max-width:100%}

        .topic-toc{
          height:100%;overflow-y:auto;
          padding:2rem 1.25rem 2rem 0.75rem;
          border-left:1px solid ${COLORS.border};
        }
        .toc-title{
          font-size:.6rem;font-weight:800;letter-spacing:.12em;
          text-transform:uppercase;color:${COLORS.textFaint};
          margin-bottom:.75rem;padding-left:.5rem;
        }
        .toc-item{
          display:block;padding:.3rem .5rem;border-radius:5px;
          font-size:.75rem;font-weight:600;line-height:1.4;
          color:${COLORS.textFaint};cursor:pointer;
          transition:color .14s,background .14s;
          border-left:2px solid transparent;
          text-decoration:none;
        }
        .toc-item:hover{color:${COLORS.textBody};background:rgba(255,255,255,0.03)}
        .toc-item.active{color:${COLORS.accent};border-left-color:${COLORS.accent};background:rgba(255,58,58,0.05)}

        .tiptap-content{color:${COLORS.textBody};font-size:.95rem;line-height:1.85}

        .tiptap-content h1,.tiptap-content h2,.tiptap-content h3,.tiptap-content h4{
          font-family:${FONTS.display};font-weight:800;color:${COLORS.textPrimary};
          letter-spacing:-.02em;margin-top:2rem;margin-bottom:.75rem;
          scroll-margin-top:80px
        }
        .tiptap-content h1{font-size:1.9rem}
        .tiptap-content h2{font-size:1.4rem;padding-bottom:.5rem;border-bottom:1px solid ${COLORS.border}}
        .tiptap-content h3{font-size:1.1rem;color:${COLORS.textBody}}
        .tiptap-content h4{font-size:.95rem}

        .tiptap-content p{margin-bottom:1rem}

        .tiptap-content strong{font-weight:800;color:${COLORS.textPrimary}}
        .tiptap-content em{font-style:italic;color:#C8C8E8}

        .tiptap-content code{
          font-family:${FONTS.mono};font-size:.82em;
          background:rgba(255,255,255,0.07);
          color:#B4C6FF;
          padding:.15em .45em;border-radius:5px;
        }

        .tiptap-content pre{
          background:#0C0C12;border:1px solid rgba(255,255,255,0.09);
          border-radius:10px;padding:1.25rem 1.5rem;overflow-x:auto;
          margin:1.25rem 0;
        }
        .tiptap-content pre code{
          background:none;color:#C8D3F5;padding:0;font-size:.85rem;line-height:1.7
        }

        .tiptap-content .hljs-keyword{color:#C792EA}
        .tiptap-content .hljs-string{color:#C3E88D}
        .tiptap-content .hljs-number{color:#F78C6C}
        .tiptap-content .hljs-comment{color:#546E7A;font-style:italic}
        .tiptap-content .hljs-built_in,.tiptap-content .hljs-literal{color:#82AAFF}
        .tiptap-content .hljs-title,.tiptap-content .hljs-function{color:#82AAFF}
        .tiptap-content .hljs-attr,.tiptap-content .hljs-attribute{color:#FFCB6B}
        .tiptap-content .hljs-type,.tiptap-content .hljs-selector-tag{color:#FFCB6B}
        .tiptap-content .hljs-variable{color:#F07178}
        .tiptap-content .hljs-operator,.tiptap-content .hljs-punctuation{color:#89DDFF}

        .tiptap-content blockquote{
          border-left:3px solid ${COLORS.accent};
          padding:.75rem 1.25rem;margin:1.25rem 0;
          background:rgba(255,58,58,0.05);border-radius:0 8px 8px 0;
          color:${COLORS.textMuted};font-size:.88rem;
        }
        .tiptap-content blockquote strong{color:${COLORS.accent}}

        .tiptap-content ul,.tiptap-content ol{padding-left:1.5rem;margin-bottom:1rem}
        .tiptap-content li{margin-bottom:.4rem}
        .tiptap-content ul li::marker{color:${COLORS.accent}}
        .tiptap-content ol li::marker{color:${COLORS.accent};font-weight:700}

        .tiptap-content hr{border:none;border-top:1px solid ${COLORS.border};margin:2rem 0}

        .tiptap-content img{max-width:100%;border-radius:8px;margin:1rem 0}

        .tiptap-content .ProseMirror{outline:none}

        .quiz-opt{
          display:flex;align-items:flex-start;gap:.75rem;
          padding:.85rem 1rem;border-radius:10px;
          border:1px solid ${COLORS.border};cursor:pointer;
          transition:all .16s;font-size:.88rem;line-height:1.5;
          background:${COLORS.bgCard};color:${COLORS.textBody};
          text-align:left;width:100%;font-family:${FONTS.body};
        }
        .quiz-opt:hover:not(.quiz-opt--disabled){border-color:rgba(255,58,58,.3);background:rgba(255,58,58,0.04)}
        .quiz-opt--selected{border-color:${COLORS.accent}!important;background:rgba(255,58,58,0.08)!important}
        .quiz-opt--correct{border-color:#22c55e!important;background:rgba(34,197,94,0.08)!important;color:#4ade80!important}
        .quiz-opt--wrong{border-color:#ef4444!important;background:rgba(239,68,68,0.08)!important;color:#f87171!important}
        .quiz-opt--missed{border-color:#22c55e!important;background:rgba(34,197,94,0.05)!important}
        .quiz-opt--disabled{cursor:default}

        .quiz-marker{
          width:20px;height:20px;border-radius:50%;border:1.5px solid currentColor;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;margin-top:1px;font-size:.65rem;font-weight:800;
          transition:all .16s;
        }
        .quiz-opt--selected .quiz-marker{background:${COLORS.accent};border-color:${COLORS.accent};color:#fff}
        .quiz-opt--correct  .quiz-marker{background:#22c55e;border-color:#22c55e;color:#fff}
        .quiz-opt--wrong    .quiz-marker{background:#ef4444;border-color:#ef4444;color:#fff}
        .quiz-opt--missed   .quiz-marker{border-color:#22c55e;color:#22c55e}

        .quiz-submit{
          background:${COLORS.accent};color:#fff;border:none;
          border-radius:10px;padding:.75rem 2rem;
          font-family:${FONTS.body};font-weight:700;font-size:.875rem;
          cursor:pointer;transition:all .18s;
        }
        .quiz-submit:hover{background:#FF5555;transform:translateY(-1px)}
        .quiz-submit:disabled{opacity:.45;cursor:not-allowed;transform:none}

        .lesson-nav-btn{
          background:${COLORS.bgCard};border:1px solid ${COLORS.border};
          border-radius:10px;padding:.65rem 1.1rem;font-family:${FONTS.body};
          font-size:.8rem;font-weight:700;color:${COLORS.textMuted};
          cursor:pointer;transition:all .18s;
        }
        .lesson-nav-btn:hover:not(:disabled){border-color:${COLORS.borderHover};color:${COLORS.textBody}}
        .lesson-nav-btn:disabled{opacity:.3;cursor:not-allowed}

        @media(max-width:1100px){
          .topic-layout{grid-template-columns:248px 1fr !important}
          .topic-toc{display:none !important}
        }
        @media(max-width:900px){
          .topic-layout{grid-template-columns:1fr !important}
          .topic-sidebar{display:none !important}
          .topic-main{padding:2rem 1.25rem !important}
        }

        @keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        .skel{background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 75%);background-size:1200px 100%;animation:shimmer 1.4s infinite;border-radius:6px}

        mark[data-sh]{background:rgba(255,200,0,0.28);color:inherit;border-radius:2px;padding:0 1px}
        .s-search{
          width:100%;background:rgba(255,255,255,0.03);
          border:1px solid ${COLORS.border};border-radius:7px;
          padding:.4rem .6rem .4rem 1.95rem;
          color:${COLORS.textPrimary};font-family:${FONTS.body};font-size:.78rem;
          outline:none;transition:border-color .2s;
        }
        .s-search:focus{border-color:rgba(255,255,255,0.16)}
        .s-search::placeholder{color:${COLORS.textFaint}}
        .s-lesson-list{transition:opacity .15s ease,transform .15s ease}
        .s-lesson-list.fading{opacity:0 !important;transform:translateY(4px) !important}
        .search-nav-btn{background:none;border:none;color:${COLORS.textMuted};cursor:pointer;padding:2px 4px;border-radius:4px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}
        .search-nav-btn:hover{background:rgba(255,255,255,0.08);color:${COLORS.textBody}}
      `}</style>

      <DashboardNav />

      <div className="topic-layout">

        <TopicSidebar
          courseId={courseId}
          topicId={topicId}
          apiLessons={apiLessons}
          displayedLessons={displayedLessons}
          apiLoading={apiLoading}
          stateCourseName={stateCourseName}
          stateCategoryName={stateCategoryName}
          stateCategoryCode={stateCategoryCode}
          moduleLabel={moduleLabel}
          searchQuery={searchQuery}
          searchFading={searchFading}
          matchCount={matchCount}
          matchIndex={matchIndex}
          searchInputRef={searchInputRef}
          onSearch={handleSearch}
          onGoNext={goNext}
          onGoPrev={goPrev}
          onNavCourses={() => navigate("/courses")}
          onNavCategory={() => stateCategoryCode ? navigate(`/courses/c/${stateCategoryCode}`) : navigate("/courses")}
          onNavModule={() => navigate(`/courses/${courseId}`, { state: { categoryName: stateCategoryName, categoryCode: stateCategoryCode } })}
          onNavLesson={id => navigate(`/courses/${courseId}/${id}`, { state: { courseName: stateCourseName, categoryName: stateCategoryName, categoryCode: stateCategoryCode } })}
        />

        {/* ── Основной контент ── */}
        <div className="topic-main-scroll" ref={mainScrollRef}>
          <article className="topic-main">

            {/* Заголовок урока */}
            <div className="fade-up-1" style={{ marginBottom: "2rem" }}>
              {moduleLabel && (
                <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".4rem" }}>
                  {moduleLabel}
                </p>
              )}
              <h1 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 800, letterSpacing: "-.025em", color: COLORS.textPrimary }}>
                {lessonTitle}
              </h1>
              {apiLesson?.auto_test && (
                <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".5rem" }}>тест</div>
              )}
            </div>

            {/* Видеолекция */}
            {videoLink && (() => {
              const embed = youtubeEmbedUrl(videoLink);
              if (!embed) return null;
              return (
                <div className="fade-up-2" style={{ marginBottom: "2rem" }}>
                  <div style={{
                    position: "relative", paddingBottom: "56.25%", height: 0,
                    borderRadius: "12px", overflow: "hidden",
                    background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
                  }}>
                    <iframe
                      src={embed}
                      title="Видеолекция"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })()}

            {/* Статья */}
            {(apiLoading && useApi) ? (
              <div className="fade-up-2" style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                <div className="skel" style={{ height: "18px", width: "75%" }} />
                <div className="skel" style={{ height: "14px", width: "90%" }} />
                <div className="skel" style={{ height: "14px", width: "60%" }} />
                <div className="skel" style={{ height: "14px", width: "82%" }} />
                <div className="skel" style={{ height: "14px", width: "70%", marginTop: ".5rem" }} />
                <div className="skel" style={{ height: "14px", width: "88%" }} />
                <div className="skel" style={{ height: "14px", width: "55%" }} />
              </div>
            ) : content ? (
              <div className="tiptap-content fade-up-2">
                <EditorContent editor={editor} />
              </div>
            ) : (
              <div className="fade-up-2" style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                <div className="skel" style={{ height: "18px", width: "75%" }} />
                <div className="skel" style={{ height: "14px", width: "90%" }} />
                <div className="skel" style={{ height: "14px", width: "60%" }} />
              </div>
            )}

            <LocalQuiz
              quiz={quiz}
              answers={answers}
              setAnswers={setAnswers}
              checked={checked}
              setChecked={setChecked}
            />

            <ApiQuiz
              apiQuiz={apiQuiz}
              apiQuizAnswers={apiQuizAnswers}
              setApiQuizAnswers={setApiQuizAnswers}
              apiQuizResults={apiQuizResults}
              setApiQuizResults={setApiQuizResults}
              apiQuizChecking={apiQuizChecking}
              onSubmit={submitApiQuiz}
            />

            {/* Навигация: пред / след */}
            <div className="fade-up-4" style={{ display: "flex", justifyContent: "space-between", marginTop: "3rem", paddingTop: "2rem", borderTop: `1px solid ${COLORS.border}` }}>
              <button
                className="lesson-nav-btn"
                disabled={currentIdx <= 0}
                onClick={() => { const prev = allLessons[currentIdx - 1]; if (prev) navigate(`/courses/${courseId}/${prev.id}`); }}
              >
                ← Предыдущий урок
              </button>
              <button
                className="lesson-nav-btn"
                disabled={currentIdx < 0 || currentIdx >= allLessons.length - 1}
                onClick={() => { const next = allLessons[currentIdx + 1]; if (next) navigate(`/courses/${courseId}/${next.id}`); }}
              >
                Следующий урок →
              </button>
            </div>

          </article>
        </div>

        <TopicTOC
          filteredTocItems={filteredTocItems}
          activeId={activeId}
          mainScrollRef={mainScrollRef}
          suppressScroll={suppressScroll}
          suppressTimer={suppressTimer}
          onActivate={setActiveId}
        />

      </div>
    </div>
  );
}
