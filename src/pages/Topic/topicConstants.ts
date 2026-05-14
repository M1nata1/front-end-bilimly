import { createLowlight, common } from "lowlight";
import { MEDIA_BASE } from "@/api/auth";

// ── Dynamic imports for local slug lessons ────────────────────
export const LESSON_CONTENT: Record<string, () => Promise<{ default: unknown }>> = {
  "relational-db": () => import("@/data/lessons/relational-db.json"),
};

export const LESSON_QUIZ: Record<string, () => Promise<{ default: unknown[] }>> = {
  "relational-db": () => import("@/data/quizzes/relational-db.json"),
};

// ── Interfaces ────────────────────────────────────────────────
export interface QuizQuestion {
  id:      number;
  type:    "single" | "multiple";
  text:    string;
  options: string[];
  correct: number[];
}

export interface ApiQuizQuestion {
  id:      number;
  type:    "single" | "multiple" | "ordering";
  content: unknown;
  options: string[];
  score:   number;
  image:   string | null;
}

export interface ApiQuizData {
  id:        number;
  title:     string;
  questions: ApiQuizQuestion[];
}

export interface ApiCheckResult {
  question_id:    number;
  is_correct:     boolean;
  correct_answer: number[];
  score:          number;
  explanation:    string | null;
}

export interface ApiLesson {
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

export interface TocItem { id: string; level: number; text: string }

// ── Theme ─────────────────────────────────────────────────────
export const COLORS = {
  bgPage: "#0D0D11", bgCard: "#13131A", bgSidebar: "#0A0A0E",
  border: "rgba(255,255,255,0.07)", borderHover: "rgba(255,58,58,0.3)",
  accent: "#FF3A3A", textPrimary: "#FAFAFF", textBody: "#F0F0FF",
  textMuted: "#B4B4D8", textFaint: "#7878A8",
};

export const FONTS = {
  display: "'Syne', sans-serif",
  body: "'Nunito', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
  googleUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Nunito:wght@400;600;700&display=swap",
};

// ── Lowlight ──────────────────────────────────────────────────
export const lowlight = createLowlight(common);

// ── Utility functions ─────────────────────────────────────────
export function fixMediaUrls(node: unknown): unknown {
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

function extractText(nodes: unknown[]): string {
  if (!Array.isArray(nodes)) return "";
  return nodes.map(n => {
    if (!n || typeof n !== "object") return "";
    const node = n as Record<string, unknown>;
    if (node.type === "text") return String(node.text ?? "");
    return extractText(node.content as unknown[]);
  }).join("");
}

export function extractHeadings(content: unknown): TocItem[] {
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

export function isNumericId(id: string | undefined): boolean {
  return !!id && /^\d+$/.test(id);
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;
    if (u.hostname === "youtu.be")               id = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch { return null; }
}
