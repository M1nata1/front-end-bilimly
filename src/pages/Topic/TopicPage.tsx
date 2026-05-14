// src/pages/Topic/TopicPage.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import ImageExtension from "@tiptap/extension-image";
import { createLowlight, common } from "lowlight";
import DashboardNav from "@/pages/Dashboard/DashboardNav";
import { API_BASE, MEDIA_BASE } from "@/api/auth";
import { TipTapContent } from "@/components/TipTapRenderer";

// ── Динамический импорт контента уроков и тестов (только для локальных slug) ──
const LESSON_CONTENT: Record<string, () => Promise<{ default: unknown }>> = {
  "relational-db": () => import("@/data/lessons/relational-db.json"),
};

const LESSON_QUIZ: Record<string, () => Promise<{ default: unknown[] }>> = {
  "relational-db": () => import("@/data/quizzes/relational-db.json"),
};

interface QuizQuestion {
  id:      number;
  type:    "single" | "multiple";
  text:    string;
  options: string[];
  correct: number[];
}

interface ApiQuizQuestion {
  id:      number;
  type:    "single" | "multiple" | "ordering";
  content: unknown;
  options: string[];
  score:   number;
  image:   string | null;
}
interface ApiQuizData {
  id:          number;
  title:       string;
  questions:   ApiQuizQuestion[];
}
interface ApiCheckResult {
  question_id:        number;
  is_correct:         boolean;
  correct_answer: number[];
  score:              number;
  explanation:        string | null;
}

interface ApiLesson {
  id:          number;
  course:      number;
  course_name: string;
  title:       string;
  content:     object;
  image:       string | null;
  is_draft:    boolean;
  auto_test:   boolean;
  priority:    number;
}

/** Рекурсивно заменяет /media/... → http://127.0.0.1:8000/media/... в TipTap JSON */
function fixMediaUrls(node: unknown): unknown {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) return node.map(fixMediaUrls);
  const obj = node as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (key === "src" && typeof val === "string" && val.startsWith("/media/")) {
      result[key] = `${MEDIA_BASE}${val}`;
    } else {
      result[key] = fixMediaUrls(val);
    }
  }
  return result;
}

const lowlight = createLowlight(common);

// ── TOC — извлечение заголовков из TipTap JSON ──────────────
interface TocItem { id: string; level: number; text: string }

function extractText(nodes: unknown[]): string {
  if (!Array.isArray(nodes)) return "";
  return nodes.map(n => {
    if (!n || typeof n !== "object") return "";
    const node = n as Record<string, unknown>;
    if (node.type === "text") return String(node.text ?? "");
    return extractText(node.content as unknown[]);
  }).join("");
}

function extractHeadings(content: unknown): TocItem[] {
  const items: TocItem[] = [];
  const seen: Record<string, number> = {};

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return;
    const n = node as Record<string, unknown>;
    if (n.type === "heading") {
      const level = (n.attrs as Record<string, unknown>)?.level as number ?? 2;
      const text  = extractText(n.content as unknown[]);
      if (!text) return;
      const raw  = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const base = raw || `h-${items.length}`;
      const slug = seen[base] ? `${base}-${seen[base]++}` : base;
      if (!seen[base]) seen[base] = 1;
      items.push({ id: slug, level, text });
    }
    if (Array.isArray(n.content)) n.content.forEach(walk);
  }

  walk(content);
  return items;
}

// ── Стили ────────────────────────────────────────────────────
const COLORS = {
  bgPage: "#0D0D11", bgCard: "#13131A", bgSidebar: "#0A0A0E",
  border: "rgba(255,255,255,0.07)", borderHover: "rgba(255,58,58,0.3)",
  accent: "#FF3A3A", textPrimary: "#FAFAFF", textBody: "#F0F0FF",
  textMuted: "#B4B4D8", textFaint: "#7878A8",
};
const FONTS = {
  display: "'Syne', sans-serif",
  body: "'Nunito', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Nunito:wght@400;600;700&display=swap",
};

function isNumericId(id: string | undefined): boolean {
  return !!id && /^\d+$/.test(id);
}

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be")               id = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}

export default function TopicPage() {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Контекст от CoursePage (название модуля для хлебных крошек)
  const locState        = (location.state as { courseName?: string; categoryName?: string; categoryCode?: string } | null);
  const stateCourseName = locState?.courseName;
  const stateCategoryName = locState?.categoryName;
  const stateCategoryCode = locState?.categoryCode;

  const useApi = isNumericId(topicId);

  // ── Состояние ────────────────────────────────────────────────
  const [content, setContent]     = useState<unknown>(null);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [quiz,    setQuiz]        = useState<QuizQuestion[]>([]);
  const [answers, setAnswers]     = useState<Record<number, number[]>>({});

  // Ref на скролл-контейнер основного контента
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Флаг: подавляем scroll listener пока идёт программный скролл
  const suppressScroll  = useRef(false);
  const suppressTimer   = useRef<ReturnType<typeof setTimeout>>();
  const [checked, setChecked]     = useState(false);

  // TOC
  const [tocItems,  setTocItems]  = useState<TocItem[]>([]);
  const [activeId,  setActiveId]  = useState<string>("");

  // API-режим
  const [apiLessons, setApiLessons] = useState<ApiLesson[] | null>(null);
  const [apiLoading, setApiLoading] = useState(useApi);

  // API-квиз урока
  const accessToken          = useAuthStore(s => s.accessToken);
  const [apiQuiz,            setApiQuiz]            = useState<ApiQuizData | null>(null);
  const [apiQuizAnswers,     setApiQuizAnswers]     = useState<Record<number, number[]>>({});
  const [apiQuizResults,     setApiQuizResults]     = useState<ApiCheckResult[] | null>(null);
  const [apiQuizChecking,    setApiQuizChecking]    = useState(false);

  // ── Поиск ─────────────────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchFading,     setSearchFading]     = useState(false);
  const [displayedLessons, setDisplayedLessons] = useState<ApiLesson[]>([]);
  const [matchCount,       setMatchCount]       = useState(0);
  const [matchIndex,       setMatchIndex]       = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchMarksRef  = useRef<HTMLElement[]>([]);

  // ── Загрузка API-уроков ───────────────────────────────────────
  useEffect(() => {
    if (!useApi) return;
    setApiLoading(true);
    fetch(`${API_BASE}/courses/${courseId}/lessons/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) { setApiLessons(data as ApiLesson[]); setDisplayedLessons(data as ApiLesson[]); } })
      .catch(() => {})
      .finally(() => setApiLoading(false));
  }, [courseId, useApi]);

  // ── Квиз урока из API ─────────────────────────────────────────
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

  const apiLesson = useMemo(
    () => apiLessons?.find(l => String(l.id) === topicId) ?? null,
    [apiLessons, topicId],
  );

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

  // ── Поиск: функции ───────────────────────────────────────────
  function clearHighlights() {
    matchMarksRef.current.forEach(mark => {
      const parent = mark.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
      parent.normalize();
    });
    matchMarksRef.current = [];
    setMatchCount(0);
    setMatchIndex(0);
  }

  function applyHighlights(query: string): HTMLElement[] {
    const container = document.querySelector(".tiptap-content .ProseMirror");
    if (!container || !query.trim()) return [];
    const q = query.toLowerCase();
    const marks: HTMLElement[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);
    textNodes.forEach(textNode => {
      const text = textNode.textContent ?? "";
      const lower = text.toLowerCase();
      if (!lower.includes(q)) return;
      const parent = textNode.parentNode;
      if (!parent) return;
      const frag = document.createDocumentFragment();
      let last = 0;
      let idx = lower.indexOf(q, 0);
      while (idx !== -1) {
        if (idx > last) frag.appendChild(document.createTextNode(text.slice(last, idx)));
        const mark = document.createElement("mark");
        mark.dataset.sh = "1";
        mark.textContent = text.slice(idx, idx + query.length);
        frag.appendChild(mark);
        marks.push(mark);
        last = idx + query.length;
        idx = lower.indexOf(q, last);
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      parent.replaceChild(frag, textNode);
    });
    return marks;
  }

  function goToMatch(marks: HTMLElement[], idx: number) {
    marks.forEach((m, i) => {
      m.style.background = i === idx ? "rgba(255,160,0,0.65)" : "";
      m.style.outline    = i === idx ? "1px solid rgba(255,160,0,0.6)" : "";
    });
    marks[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    // Fade + filter lesson list
    setSearchFading(true);
    setTimeout(() => {
      setDisplayedLessons((apiLessons ?? []).filter(l => l.title.toLowerCase().includes(q.toLowerCase())));
      setSearchFading(false);
    }, 150);
    // Highlight matching text in content
    clearHighlights();
    if (q.trim()) {
      const marks = applyHighlights(q);
      matchMarksRef.current = marks;
      setMatchCount(marks.length);
      setMatchIndex(0);
      if (marks.length) goToMatch(marks, 0);
    }
  }

  function goNext() {
    const marks = matchMarksRef.current;
    if (!marks.length) return;
    const next = (matchIndex + 1) % marks.length;
    setMatchIndex(next);
    goToMatch(marks, next);
  }

  function goPrev() {
    const marks = matchMarksRef.current;
    if (!marks.length) return;
    const prev = (matchIndex - 1 + marks.length) % marks.length;
    setMatchIndex(prev);
    goToMatch(marks, prev);
  }

  // ── Загрузка контента ─────────────────────────────────────────
  useEffect(() => {
    if (useApi) {
      if (apiLesson) {
        const raw = apiLesson.content as Record<string, unknown> | null;
        // Some lessons wrap the actual doc inside `lesson_text`
        const doc = raw && typeof raw === "object" && raw.lesson_text ? raw.lesson_text : raw;
        setContent(fixMediaUrls(doc));
        const vl = (doc as Record<string, unknown>)?.videoLink;
        setVideoLink(typeof vl === "string" ? vl : null);
      }
      return;
    }
    setVideoLink(null);
    const loader = LESSON_CONTENT[topicId ?? ""];
    if (loader) loader().then(m => setContent(m.default));
    else setContent(null);

    const quizLoader = LESSON_QUIZ[topicId ?? ""];
    if (quizLoader) quizLoader().then(m => { setQuiz(m.default as QuizQuestion[]); setAnswers({}); setChecked(false); });
    else { setQuiz([]); setAnswers({}); setChecked(false); }
  }, [topicId, useApi, apiLesson]);

  // TipTap editor в read-only режиме
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      ImageExtension.configure({ inline: false }),
    ],
    content: undefined,
    editable: false,
  });

  useEffect(() => {
    if (editor && content) {
      const c = content as Record<string, unknown>;
      if (c?.type === "doc") editor.commands.setContent(c as object);
    }
  }, [editor, content]);

  // ── TOC: извлекаем заголовки из JSON ────────────────────────
  useEffect(() => {
    if (content) setTocItems(extractHeadings(content));
    else         setTocItems([]);
  }, [content]);

  // ── TOC: ID-инъекция ─────────────────────────────────────────
  useEffect(() => {
    if (!editor || !tocItems.length) return;

    const inject = () => {
      const pm = document.querySelector(".tiptap-content .ProseMirror");
      if (!pm) return;
      const els = pm.querySelectorAll("h1,h2,h3,h4");
      els.forEach((el, i) => { if (tocItems[i]) el.id = tocItems[i].id; });
    };

    const raf = requestAnimationFrame(inject);
    editor.on("update", inject);
    return () => { cancelAnimationFrame(raf); editor.off("update", inject); };
  }, [editor, tocItems]);

  // ── TOC: активный заголовок по скроллу ───────────────────────
  // Квери DOM напрямую — не зависит от того, проставлены ли id.
  // Suppress-флаг не даёт listener перезаписать click-активацию во время smooth scroll.
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

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("scroll", onScroll);
    };
  }, [tocItems]);

  // ── Поиск: Ctrl+F фокусирует строку в сайдбаре ──────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Поиск: сброс при смене урока ──────────────────────────────
  useEffect(() => {
    setSearchQuery("");
    setSearchFading(false);
    setDisplayedLessons(apiLessons ?? []);
    matchMarksRef.current.forEach(mark => {
      const parent = mark.parentNode;
      if (parent) { parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark); parent.normalize(); }
    });
    matchMarksRef.current = [];
    setMatchCount(0);
    setMatchIndex(0);
  }, [topicId]);

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

  // ── Заголовок урока ───────────────────────────────────────────
  // course_name из API = название модуля (например "База данных")
  const lessonTitle  = apiLesson?.title ?? (apiLoading ? "Загрузка..." : "Урок не найден");
  const moduleLabel  = apiLesson?.course_name ?? stateCourseName ?? "";

  return (
    <div style={{ background: COLORS.bgPage, color: COLORS.textBody, fontFamily: FONTS.body, height: "100vh", overflow: "hidden" }}>
      <link href={FONTS.googleUrl} rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}

        /* ── Сайдбар ── */
        .topic-layout{display:grid;grid-template-columns:300px 1fr 260px;height:calc(100vh - 57px);overflow:hidden}
        .topic-sidebar{
          height:100%;overflow-y:auto;background:${COLORS.bgSidebar};
          border-right:1px solid ${COLORS.border};padding:1.25rem 0;
        }
        .topic-main-scroll{height:100%;overflow-y:auto}

        /* ── Scrollbars ── */
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

        /* ── Основной контент ── */
        .topic-main{padding:2.5rem 2.5rem;max-width:100%}

        /* ── TOC (содержание справа) ── */
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

        /* ── TipTap типографика ── */
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

        /* Подсветка синтаксиса */
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

        .tiptap-content ul,.tiptap-content ol{
          padding-left:1.5rem;margin-bottom:1rem
        }
        .tiptap-content li{margin-bottom:.4rem}
        .tiptap-content ul li::marker{color:${COLORS.accent}}
        .tiptap-content ol li::marker{color:${COLORS.accent};font-weight:700}

        .tiptap-content hr{
          border:none;border-top:1px solid ${COLORS.border};margin:2rem 0
        }

        .tiptap-content img{max-width:100%;border-radius:8px;margin:1rem 0}

        .tiptap-content .ProseMirror{outline:none}

        /* ── Тест ── */
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

        /* ── Навигация по урокам ── */
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

        /* ── Поиск ── */
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

        {/* ── Сайдбар ── */}
        <aside className="topic-sidebar">
          {/* Breadcrumb */}
          <div style={{ padding: ".25rem 1.25rem 1rem", borderBottom: `1px solid ${COLORS.border}`, marginBottom: ".5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".72rem", color: COLORS.textFaint, flexWrap: "wrap" }}>
              <span style={{ cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
                onClick={() => navigate("/courses")}>
                Курсы
              </span>
              {stateCategoryName && (
                <>
                  <span>/</span>
                  <span style={{ cursor: "pointer", transition: "color .15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
                    onClick={() => stateCategoryCode ? navigate(`/courses/c/${stateCategoryCode}`) : navigate("/courses")}>
                    {stateCategoryName}
                  </span>
                </>
              )}
              <span>/</span>
              <span style={{ cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
                onClick={() => navigate(`/courses/${courseId}`, { state: { categoryName: stateCategoryName, categoryCode: stateCategoryCode } })}>
                {moduleLabel || courseId}
              </span>
            </div>
          </div>

          {/* Поиск */}
          <div style={{ padding: ".5rem .75rem", borderBottom: `1px solid ${COLORS.border}`, position: "relative", display: "flex", alignItems: "center", gap: ".35rem" }}>
            <svg style={{ position: "absolute", left: "1.45rem", top: "50%", transform: "translateY(-50%)", opacity: .32, pointerEvents: "none", flexShrink: 0 }} width="12" height="12" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#FAFAFF" strokeWidth="1.7"/>
              <path d="M13 13l3.5 3.5" stroke="#FAFAFF" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchInputRef}
              className="s-search"
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); e.shiftKey ? goPrev() : goNext(); }
                if (e.key === "Escape") handleSearch("");
              }}
            />
            {searchQuery && matchCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "1px", flexShrink: 0 }}>
                <span style={{ fontSize: ".62rem", color: COLORS.textFaint, minWidth: "26px", textAlign: "center" }}>
                  {matchIndex + 1}/{matchCount}
                </span>
                <button className="search-nav-btn" onClick={goPrev} title="Предыдущее (Shift+Enter)">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="search-nav-btn" onClick={goNext} title="Следующее (Enter)">
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* Список уроков */}
          {apiLoading && (
            <div style={{ padding: ".75rem 1.25rem", fontSize: ".78rem", color: COLORS.textFaint }}>Загрузка...</div>
          )}
          <div className={`s-lesson-list${searchFading ? " fading" : ""}`}>
            {!searchFading && displayedLessons.length === 0 && searchQuery && (
              <div style={{ padding: ".6rem 1.25rem", fontSize: ".75rem", color: COLORS.textFaint, fontStyle: "italic" }}>Ничего не найдено</div>
            )}
            {displayedLessons.map(l => {
              const origIdx = (apiLessons ?? []).findIndex(a => a.id === l.id);
              return (
                <div
                  key={l.id}
                  className={`sidebar-lesson${String(l.id) === topicId ? " active" : ""}`}
                  onClick={() => navigate(`/courses/${courseId}/${l.id}`, { state: { courseName: stateCourseName, categoryName: stateCategoryName, categoryCode: stateCategoryCode } })}
                >
                  <span style={{ fontSize: ".6rem", fontWeight: 800, width: "16px", flexShrink: 0, textAlign: "right" }}>
                    {String(origIdx + 1).padStart(2, "0")}
                  </span>
                  {l.title}
                </div>
              );
            })}
          </div>
        </aside>

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

            {/* ── Тест (только для slug-уроков с локальным квизом) ── */}
            {quiz.length > 0 && (
              <div style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: `1px solid ${COLORS.border}` }}>
                <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
                  Тест по теме
                </p>
                <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, color: COLORS.textPrimary, marginBottom: "2rem" }}>
                  Проверь себя
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {quiz.map((q, qi) => {
                    const selected = answers[q.id] ?? [];
                    const isMultiple = q.type === "multiple";

                    const toggle = (oi: number) => {
                      if (checked) return;
                      setAnswers(prev => {
                        const cur = prev[q.id] ?? [];
                        if (isMultiple) {
                          return { ...prev, [q.id]: cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi] };
                        }
                        return { ...prev, [q.id]: [oi] };
                      });
                    };

                    const getOptClass = (oi: number) => {
                      let cls = "quiz-opt";
                      if (checked) {
                        cls += " quiz-opt--disabled";
                        const isCorrect = Array.isArray(q.correct) && q.correct.includes(oi);
                        const isSelected = selected.includes(oi);
                        if (isSelected && isCorrect)       cls += " quiz-opt--correct";
                        else if (isSelected && !isCorrect) cls += " quiz-opt--wrong";
                        else if (!isSelected && isCorrect) cls += " quiz-opt--missed";
                      } else {
                        if (selected.includes(oi)) cls += " quiz-opt--selected";
                      }
                      return cls;
                    };

                    return (
                      <div key={q.id}>
                        <div style={{ display: "flex", gap: ".6rem", marginBottom: "1rem", alignItems: "baseline" }}>
                          <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".75rem", color: COLORS.accent, flexShrink: 0 }}>
                            {String(qi + 1).padStart(2, "0")}
                          </span>
                          <p style={{ fontSize: ".92rem", fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.55 }}>
                            {q.text}
                          </p>
                        </div>
                        {isMultiple && (
                          <p style={{ fontSize: ".72rem", color: COLORS.textFaint, marginBottom: ".75rem" }}>
                            Выберите все верные варианты
                          </p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                          {(Array.isArray(q.options) ? q.options : []).map((opt, oi) => (
                            <button key={oi} className={getOptClass(oi)} onClick={() => toggle(oi)}>
                              <span className="quiz-marker">
                                {checked && Array.isArray(q.correct) && q.correct.includes(oi) ? "✓" :
                                 checked && selected.includes(oi) && !(Array.isArray(q.correct) && q.correct.includes(oi)) ? "✗" : ""}
                              </span>
                              {typeof opt === "string" ? opt : String(opt ?? "")}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {checked && (() => {
                  const score = quiz.filter(q => {
                    const sel = answers[q.id] ?? [];
                    return sel.length === q.correct.length && q.correct.every(c => sel.includes(c));
                  }).length;
                  return (
                    <div style={{
                      marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "12px",
                      background: score === quiz.length ? "rgba(34,197,94,0.08)" : "rgba(255,58,58,0.08)",
                      border: `1px solid ${score === quiz.length ? "rgba(34,197,94,0.2)" : "rgba(255,58,58,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem",
                    }}>
                      <div>
                        <div style={{ fontSize: ".95rem", fontWeight: 700, color: score === quiz.length ? "#4ade80" : COLORS.textPrimary }}>
                          {score === quiz.length ? "Отлично! Все верно." : `${score} из ${quiz.length} правильно`}
                        </div>
                        <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".2rem" }}>
                          {score < quiz.length ? "Перечитай тему и попробуй снова" : "Можно переходить к следующему уроку"}
                        </div>
                      </div>
                      <button
                        className="quiz-submit"
                        style={{ background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, fontSize: ".8rem", padding: ".5rem 1rem" }}
                        onClick={() => { setAnswers({}); setChecked(false); }}
                      >
                        Пройти снова
                      </button>
                    </div>
                  );
                })()}

                {!checked && (
                  <button
                    className="quiz-submit"
                    style={{ marginTop: "1.5rem" }}
                    disabled={Object.keys(answers).length < quiz.length}
                    onClick={() => setChecked(true)}
                  >
                    Проверить ответы
                  </button>
                )}
              </div>
            )}

            {/* ── Квиз урока из API ── */}
            {apiQuiz && apiQuiz.questions.length > 0 && (
              <div className="fade-up-3" style={{ marginTop: "3rem", paddingTop: "2.5rem", borderTop: `1px solid ${COLORS.border}` }}>
                <p style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: COLORS.accent, marginBottom: ".5rem" }}>
                  Тест по теме
                </p>
                <h2 style={{ fontFamily: FONTS.display, fontSize: "1.3rem", fontWeight: 800, color: COLORS.textPrimary, marginBottom: "2rem" }}>
                  Проверь себя
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {apiQuiz.questions.map((q, qi) => {
                    const selected  = apiQuizAnswers[q.id] ?? [];
                    const result    = apiQuizResults?.find(r => r.question_id === q.id);
                    const isDone    = !!apiQuizResults;
                    const isMulti   = q.type !== "single";

                    const toggleOpt = (oi: number) => {
                      if (isDone) return;
                      setApiQuizAnswers(prev => {
                        const cur = prev[q.id] ?? [];
                        if (isMulti) {
                          return { ...prev, [q.id]: cur.includes(oi) ? cur.filter(x => x !== oi) : [...cur, oi] };
                        }
                        return { ...prev, [q.id]: cur.includes(oi) ? [] : [oi] };
                      });
                    };

                    const getOptClass = (oi: number) => {
                      let cls = "quiz-opt";
                      if (isDone) {
                        cls += " quiz-opt--disabled";
                        const isCorrect  = result?.correct_answer?.includes(oi) ?? false;
                        const isSelected = selected.includes(oi);
                        if (isSelected && isCorrect)       cls += " quiz-opt--correct";
                        else if (isSelected && !isCorrect) cls += " quiz-opt--wrong";
                        else if (!isSelected && isCorrect) cls += " quiz-opt--missed";
                      } else if (selected.includes(oi)) {
                        cls += " quiz-opt--selected";
                      }
                      return cls;
                    };

                    return (
                      <div key={q.id}>
                        <div style={{ display: "flex", gap: ".6rem", marginBottom: "1rem", alignItems: "baseline" }}>
                          <span style={{ fontFamily: FONTS.display, fontWeight: 800, fontSize: ".75rem", color: COLORS.accent, flexShrink: 0 }}>
                            {String(qi + 1).padStart(2, "0")}
                          </span>
                          <div style={{ fontSize: ".92rem", fontWeight: 600, color: COLORS.textPrimary, lineHeight: 1.55 }}>
                            <TipTapContent content={q.content} />
                          </div>
                        </div>
                        {q.image && (
                          <img
                            src={q.image}
                            alt=""
                            style={{ maxWidth: "100%", maxHeight: "320px", objectFit: "contain", borderRadius: "10px", marginBottom: "1rem", display: "block" }}
                          />
                        )}
                        {isMulti && !isDone && (
                          <p style={{ fontSize: ".72rem", color: COLORS.textFaint, marginBottom: ".75rem" }}>
                            Выберите все верные варианты
                          </p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
                          {(Array.isArray(q.options) ? q.options : []).map((opt, oi) => (
                            <button key={oi} className={getOptClass(oi)} onClick={() => toggleOpt(oi)}>
                              <span className="quiz-marker">
                                {isDone && (result?.correct_answer?.includes(oi) ? "✓" : selected.includes(oi) ? "✗" : "")}
                              </span>
                              {typeof opt === "string" ? opt : String(opt ?? "")}
                            </button>
                          ))}
                        </div>
                        {isDone && result?.explanation && (
                          <p style={{ fontSize: ".78rem", color: COLORS.textMuted, marginTop: ".6rem", paddingLeft: "1rem", borderLeft: `2px solid ${COLORS.border}`, lineHeight: 1.6 }}>
                            💡 {result.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Результат */}
                {apiQuizResults && (() => {
                  const correct = apiQuizResults.filter(r => r.is_correct).length;
                  const total   = apiQuiz.questions.length;
                  const perfect = correct === total;
                  return (
                    <div style={{
                      marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: "12px",
                      background: perfect ? "rgba(34,197,94,0.08)" : "rgba(255,58,58,0.08)",
                      border: `1px solid ${perfect ? "rgba(34,197,94,0.2)" : "rgba(255,58,58,0.2)"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: ".75rem",
                    }}>
                      <div>
                        <div style={{ fontSize: ".95rem", fontWeight: 700, color: perfect ? "#4ade80" : COLORS.textPrimary }}>
                          {perfect ? "Отлично! Все верно." : `${correct} из ${total} правильно`}
                        </div>
                        <div style={{ fontSize: ".75rem", color: COLORS.textFaint, marginTop: ".2rem" }}>
                          {!perfect ? "Перечитай тему и попробуй снова" : "Можно переходить к следующему уроку"}
                        </div>
                      </div>
                      <button
                        className="quiz-submit"
                        style={{ background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, fontSize: ".8rem", padding: ".5rem 1rem" }}
                        onClick={() => { setApiQuizAnswers({}); setApiQuizResults(null); }}
                      >
                        Пройти снова
                      </button>
                    </div>
                  );
                })()}

                {/* Кнопка проверки */}
                {!apiQuizResults && (
                  <button
                    className="quiz-submit"
                    style={{ marginTop: "1.5rem" }}
                    disabled={apiQuizChecking || Object.keys(apiQuizAnswers).length < apiQuiz.questions.length}
                    onClick={submitApiQuiz}
                  >
                    {apiQuizChecking ? "Проверяем..." : "Проверить ответы"}
                  </button>
                )}
              </div>
            )}

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

        {/* ── TOC — содержание темы ── */}
        <aside className="topic-toc">
          {filteredTocItems.length > 0 && (
            <>
              <div className="toc-title">Содержание</div>
              {filteredTocItems.map(item => (
                <div
                  key={item.id}
                  className={`toc-item${activeId === item.id ? " active" : ""}`}
                  style={{ paddingLeft: `${(item.level - 1) * 10 + 8}px` }}
                  onClick={() => {
                    setActiveId(item.id);

                    // Подавляем scroll listener пока идёт smooth scroll
                    suppressScroll.current = true;
                    clearTimeout(suppressTimer.current);
                    suppressTimer.current = setTimeout(() => {
                      suppressScroll.current = false;
                    }, 900);

                    const el = document.getElementById(item.id);
                    const container = mainScrollRef.current;
                    if (!el || !container) return;
                    const newTop = container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top - 20;
                    container.scrollTo({ top: Math.max(0, newTop), behavior: "smooth" });
                  }}
                >
                  {item.text}
                </div>
              ))}
            </>
          )}
        </aside>

      </div>
    </div>
  );
}
