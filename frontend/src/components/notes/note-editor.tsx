"use client";

import { useEffect } from "react";
import "vazirmatn/Vazirmatn-font-face.css";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TextAlign from "@tiptap/extension-text-align";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBold,
  IconCode,
  IconItalic,
  IconList,
  IconListCheck,
  IconQuote,
  IconStrikethrough,
  IconUnderline,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Content = Record<string, unknown> | null | undefined;

export function NoteEditor({
  content,
  onChange,
}: {
  content: Content;
  onChange: (content: Record<string, unknown>, plainText: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content:
      content && typeof content === "object" && "type" in content
        ? content
        : "",
    editorProps: {
      attributes: {
        class: "note-prosemirror min-h-[42rem] px-1 py-6 outline-none",
        dir: "auto",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = instance.getJSON() as Record<string, unknown>;
      const plainText = instance.getText();
      onChange(next, plainText);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const next =
      content && typeof content === "object" && "type" in content
        ? content
        : "";
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(next))
      editor.commands.setContent(next, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return null;
  const tool = (active: boolean) =>
    cn("size-8", active && "bg-muted text-foreground");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-0.5 rounded-md border bg-muted/25 p-1">
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <IconBold className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <IconItalic className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <IconUnderline className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("strike"))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <IconStrikethrough className="size-4" />
        </Button>
        <span className="mx-1 h-5 border-l" />
        <Button
          variant="ghost"
          size="sm"
          className={tool(editor.isActive("heading", { level: 1 }))}
          title="Heading 1 — applies to the current paragraph or selected paragraphs"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={tool(editor.isActive("heading", { level: 2 }))}
          title="Heading 2 — applies to the current paragraph or selected paragraphs"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <IconList className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("taskList"))}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <IconListCheck className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <IconQuote className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={tool(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <IconCode className="size-4" />
        </Button>
        <span className="mx-1 h-5 border-l" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Right-to-left — applies to the current paragraph or selected paragraphs"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          Right
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Left-to-right — applies to the current paragraph or selected paragraphs"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          Left
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <IconArrowLeft className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <IconArrowRight className="size-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
