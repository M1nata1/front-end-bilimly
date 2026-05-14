import { useState, useRef, useEffect } from "react";
import { ApiLesson } from "../topicConstants";

export function useContentSearch(
  apiLessons: ApiLesson[] | null,
  topicId: string | undefined,
) {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [searchFading,     setSearchFading]     = useState(false);
  const [displayedLessons, setDisplayedLessons] = useState<ApiLesson[]>([]);
  const [matchCount,       setMatchCount]       = useState(0);
  const [matchIndex,       setMatchIndex]       = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const matchMarksRef  = useRef<HTMLElement[]>([]);

  useEffect(() => {
    setDisplayedLessons(apiLessons ?? []);
  }, [apiLessons]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

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
    setSearchFading(true);
    setTimeout(() => {
      setDisplayedLessons((apiLessons ?? []).filter(l => l.title.toLowerCase().includes(q.toLowerCase())));
      setSearchFading(false);
    }, 150);
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

  return {
    searchQuery, setSearchQuery,
    searchFading,
    displayedLessons,
    matchCount, matchIndex,
    handleSearch, goNext, goPrev,
    searchInputRef, matchMarksRef,
  };
}
