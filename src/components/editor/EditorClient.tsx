"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Column, Heading, Button } from "@once-ui-system/core";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), { ssr: false });

export default function EditorClient() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  const save = async (publish = false) => {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, content, publish }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to save article");
      return;
    }

    alert(`Saved article: ${data.slug}`);
  };

  // Load draft if ?slug=<slug> present
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get("slug");
      if (!slug) return;
      setLoadedSlug(slug);
      (async () => {
        const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          console.warn("Draft not found");
          return;
        }
        const data = await res.json();
        // naive parsing: keep frontmatter, set content full
        setContent(data.content || "");
        // try to extract title/summary from frontmatter
        const fmMatch = data.content.match(/---[\s\S]*?---/);
        if (fmMatch) {
          const fm = fmMatch[0];
          const titleMatch = fm.match(/title:\s*"([^"]*)"/);
          const summaryMatch = fm.match(/summary:\s*"([^"]*)"/);
          if (titleMatch) setTitle(titleMatch[1]);
          if (summaryMatch) setSummary(summaryMatch[1]);
        }
      })();
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <Column maxWidth="m" paddingTop="24" gap="16">
      <Heading>Write an article</Heading>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        style={{
          width: "100%",
          border: "1px solid var(--neutral-medium)",
          borderRadius: 8,
          padding: "10px 12px",
          background: "transparent",
          color: "inherit",
        }}
      />
      <input
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        placeholder="Summary"
        style={{
          width: "100%",
          border: "1px solid var(--neutral-medium)",
          borderRadius: 8,
          padding: "10px 12px",
          background: "transparent",
          color: "inherit",
        }}
      />
      <TiptapEditor content={content} onChange={setContent} />
      <Button onClick={() => save(false)}>Save Draft</Button>
      <Button onClick={() => save(true)}>Publish</Button>
    </Column>
  );
}
