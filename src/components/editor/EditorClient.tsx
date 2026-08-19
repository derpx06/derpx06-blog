"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/site/toast";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), { ssr: false });

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export default function EditorClient() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tag, setTag] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const { addToast } = useToast();

  useEffect(() => {
    const existing = new URLSearchParams(window.location.search).get("slug");
    if (!existing) return;
    setSlug(existing);

    fetch(`/api/articles?slug=${encodeURIComponent(existing)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) {
          setStatus({ kind: "error", message: "That draft could not be loaded." });
          return;
        }
        setContent(data.content || "");
        setTitle(data.metadata?.title || "");
        setSummary(data.metadata?.summary || "");
        setTag(data.metadata?.tag || "");
      })
      .catch(() => setStatus({ kind: "error", message: "That draft could not be loaded." }));
  }, []);

  const save = async (publish: boolean) => {
    if (!title.trim()) {
      setStatus({ kind: "error", message: "Give the piece a title first." });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug || undefined,
          section: "blog",
          title,
          summary,
          tag,
          content,
          bodyFormat: "html",
          publish,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save the article");

      setSlug(data.slug);
      setStatus({ kind: "saved", message: publish ? "Published" : "Draft saved" });
      addToast({ variant: "success", message: publish ? "Published." : "Draft saved." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save the article";
      setStatus({ kind: "error", message });
      addToast({ variant: "danger", message });
    }
  };

  return (
    <main id="main" style={{ padding: "38px var(--gut) 60px" }}>
      <div className="ds-between" style={{ marginBottom: 22 }}>
        <h1 className="ds-t-page">Write</h1>
        <Link href="/blog/editor/drafts" className="ds-box">
          Drafts
        </Link>
      </div>

      <div className="ds-stack" style={{ gap: 12 }}>
        <label className="ds-sr" htmlFor="editor-title">
          Title
        </label>
        <input
          id="editor-title"
          className="ds-field"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          style={{ flex: "none", fontSize: 18 }}
        />

        <label className="ds-sr" htmlFor="editor-summary">
          Summary
        </label>
        <input
          id="editor-summary"
          className="ds-field"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="One-sentence summary"
          style={{ flex: "none" }}
        />

        <label className="ds-sr" htmlFor="editor-tag">
          Tag
        </label>
        <input
          id="editor-tag"
          className="ds-field"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          placeholder="Tag, e.g. LLM Systems"
          style={{ flex: "none" }}
        />

        <TiptapEditor
          content={content}
          onChange={setContent}
          onError={(message) => addToast({ variant: "danger", message })}
        />

        <div className="ds-row">
          <button
            type="button"
            className="ds-box"
            onClick={() => save(false)}
            disabled={status.kind === "saving"}
          >
            Save draft
          </button>
          <button
            type="button"
            className="ds-box ds-dark"
            onClick={() => save(true)}
            disabled={status.kind === "saving"}
          >
            Publish
          </button>
          {status.message && (
            <span
              className="ds-meta ds-meta-s"
              role="status"
              style={{ color: status.kind === "error" ? "var(--acc)" : undefined }}
            >
              {status.message}
            </span>
          )}
          {slug && (
            <Link href={`/blog/${slug}`} className="ds-meta ds-meta-s">
              View /blog/{slug}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
