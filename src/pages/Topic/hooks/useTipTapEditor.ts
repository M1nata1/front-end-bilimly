import { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import ImageExtension from "@tiptap/extension-image";
import { lowlight, extractHeadings, TocItem } from "../topicConstants";

export function useTipTapEditor(content: unknown) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

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

  useEffect(() => {
    if (content) setTocItems(extractHeadings(content));
    else         setTocItems([]);
  }, [content]);

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

  return { editor, tocItems };
}
