"use client";

import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Typo from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import { Button, Row } from "@once-ui-system/core";

interface Props {
  content?: string;
  onChange?: (content: string) => void;
}

export default function TiptapEditor({ content = "", onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Typo,
      Placeholder.configure({ placeholder: "Write something amazing..." }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(content || "");
  }, [content, editor]);

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const selectedFile = input.files?.[0];
      if (!selectedFile || !editor) return;

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        setUploading(true);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.url) {
          throw new Error(data.message || "Image upload failed");
        }
        editor.chain().focus().setImage({ src: data.url }).run();
      } catch (error) {
        alert(error instanceof Error ? error.message : "Image upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div>
      <Row gap="8" marginBottom="8">
        <Button size="s" variant="secondary" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button size="s" variant="secondary" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button size="s" variant="secondary" onClick={openFilePicker} disabled={uploading}>
          {uploading ? "Uploading..." : "Add Image"}
        </Button>
      </Row>
      <EditorContent editor={editor} />
    </div>
  );
}
