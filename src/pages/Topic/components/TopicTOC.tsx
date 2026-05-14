import { MutableRefObject, RefObject } from "react";
import { TocItem } from "../topicConstants";

interface Props {
  filteredTocItems: TocItem[];
  activeId: string;
  mainScrollRef: RefObject<HTMLDivElement>;
  suppressScroll: MutableRefObject<boolean>;
  suppressTimer: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  onActivate: (id: string) => void;
}

export default function TopicTOC({
  filteredTocItems, activeId,
  mainScrollRef, suppressScroll, suppressTimer,
  onActivate,
}: Props) {
  if (filteredTocItems.length === 0) return <aside className="topic-toc" />;

  return (
    <aside className="topic-toc">
      <div className="toc-title">Содержание</div>
      {filteredTocItems.map(item => (
        <div
          key={item.id}
          className={`toc-item${activeId === item.id ? " active" : ""}`}
          style={{ paddingLeft: `${(item.level - 1) * 10 + 8}px` }}
          onClick={() => {
            onActivate(item.id);

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
    </aside>
  );
}
