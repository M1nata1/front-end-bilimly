import { RefObject } from "react";
import { COLORS, FONTS, ApiLesson } from "../topicConstants";

interface Props {
  courseId: string | undefined;
  topicId: string | undefined;
  apiLessons: ApiLesson[] | null;
  displayedLessons: ApiLesson[];
  apiLoading: boolean;
  stateCourseName: string | undefined;
  stateCategoryName: string | undefined;
  stateCategoryCode: string | undefined;
  moduleLabel: string;
  searchQuery: string;
  searchFading: boolean;
  matchCount: number;
  matchIndex: number;
  searchInputRef: RefObject<HTMLInputElement>;
  onSearch: (q: string) => void;
  onGoNext: () => void;
  onGoPrev: () => void;
  onNavCourses: () => void;
  onNavCategory: () => void;
  onNavModule: () => void;
  onNavLesson: (lessonId: number) => void;
}

export default function TopicSidebar({
  courseId, topicId,
  apiLessons, displayedLessons, apiLoading,
  stateCourseName: _stateCourseName,
  stateCategoryName, stateCategoryCode: _stateCategoryCode,
  moduleLabel,
  searchQuery, searchFading,
  matchCount, matchIndex,
  searchInputRef,
  onSearch, onGoNext, onGoPrev,
  onNavCourses, onNavCategory, onNavModule, onNavLesson,
}: Props) {
  return (
    <aside className="topic-sidebar">
      {/* Breadcrumb */}
      <div style={{ padding: ".25rem 1.25rem 1rem", borderBottom: `1px solid ${COLORS.border}`, marginBottom: ".5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".72rem", color: COLORS.textFaint, flexWrap: "wrap" }}>
          <span style={{ cursor: "pointer", transition: "color .15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
            onClick={onNavCourses}>
            Курсы
          </span>
          {stateCategoryName && (
            <>
              <span>/</span>
              <span style={{ cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
                onClick={onNavCategory}>
                {stateCategoryName}
              </span>
            </>
          )}
          <span>/</span>
          <span style={{ cursor: "pointer", transition: "color .15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = COLORS.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = COLORS.textFaint)}
            onClick={onNavModule}>
            {moduleLabel || courseId}
          </span>
        </div>
      </div>

      {/* Search */}
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
          onChange={e => onSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") { e.preventDefault(); e.shiftKey ? onGoPrev() : onGoNext(); }
            if (e.key === "Escape") onSearch("");
          }}
        />
        {searchQuery && matchCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "1px", flexShrink: 0 }}>
            <span style={{ fontSize: ".62rem", color: COLORS.textFaint, minWidth: "26px", textAlign: "center" }}>
              {matchIndex + 1}/{matchCount}
            </span>
            <button className="search-nav-btn" onClick={onGoPrev} title="Предыдущее (Shift+Enter)">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 6.5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="search-nav-btn" onClick={onGoNext} title="Следующее (Enter)">
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Lesson list */}
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
              onClick={() => onNavLesson(l.id)}
            >
              <span style={{ fontSize: ".6rem", fontWeight: 800, width: "16px", flexShrink: 0, textAlign: "right", fontFamily: FONTS.display }}>
                {String(origIdx + 1).padStart(2, "0")}
              </span>
              {l.title}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
