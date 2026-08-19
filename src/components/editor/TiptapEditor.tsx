"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Typo from "@tiptap/extension-typography";
import { useEffect, useRef, useState } from "react";

interface Props {
  content?: string;
  onChange?: (content: string) => void;
  onError?: (message: string) => void;
}

const MARKS = [
  { label: "Bold", run: (chain: any) => chain.toggleBold(), mark: "bold" },
  { label: "Italic", run: (chain: any) => chain.toggleItalic(), mark: "italic" },
  { label: "H2", run: (chain: any) => chain.toggleHeading({ level: 2 }), mark: "heading" },
  { label: "Quote", run: (chain: any) => chain.toggleBlockquote(), mark: "blockquote" },
  { label: "List", run: (chain: any) => chain.toggleBulletList(), mark: "bulletList" },
  { label: "Code", run: (chain: any) => chain.toggleCodeBlock(), mark: "codeBlock" },
];

export default function TiptapEditor({ content = "", onChange, onError }: Props) {
  const [uploading, setUploading] = useState(false);
  // Guards the setContent effect from clobbering what the user is typing.
  const lastLoaded = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Typo,
      Placeholder.configure({ placeholder: "Write something worth reading…" }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor || content === lastLoaded.current) return;
    lastLoaded.current = content;
    editor.commands.setContent(content || "");
  }, [content, editor]);

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        setUploading(true);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok || !data.url) throw new Error(data.message || "Image upload failed");
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Image upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="ds-editor">
      <div className="ds-editor-bar">
        {MARKS.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`ds-box ds-sm${editor?.isActive(item.mark) ? " ds-dark" : ""}`}
            onClick={() => item.run(editor?.chain().focus())?.run()}
          >
            {item.label}
          </button>
        ))}
        <button type="button" className="ds-box ds-sm" onClick={openFilePicker} disabled={uploading}>
          {uploading ? "Uploading…" : "Image"}
        </button>
      </div>
      <EditorContent editor={editor} className="ds-editor-body ds-prose" />
    </div>
  );
}
