"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import { htmlToMarkdown, markdownToHtml } from "./markdown";
import { uploadImage } from "./upload";
import styles from "./editor.module.scss";

const SimpleEditor = dynamic(() => import("@/components/tiptap-templates/simple/simple-editor").then((m) => m.SimpleEditor), {
  ssr: false,
  loading: () => <div className={styles.loading}>Loading editor…</div>,
});

type Section = "blog" | "explainers";
type Storage = "mdx" | "mongodb";
const today = () => new Date().toISOString().slice(0, 10);
const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const DEFAULT_STORAGE: Storage = process.env.NEXT_PUBLIC_DEFAULT_ARTICLE_STORAGE === "mdx" ? "mdx" : "mongodb";
// `id` is a client-only React key; the API ignores it.
type Source = { id: string; title: string; url: string; authors: string; year: string };
const blankSource = (): Source => ({ id: crypto.randomUUID(), title: "", url: "", authors: "", year: "" });

export default function EditorClient() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [summary, setSummary] = useState("");
  const [tag, setTag] = useState("");
  const [topics, setTopics] = useState("");
  const [image, setImage] = useState("");
  const [publishedAt, setPublishedAt] = useState(today);
  const [section, setSection] = useState<Section>("blog");
  const [storage, setStorage] = useState<Storage>(DEFAULT_STORAGE);
  const [sources, setSources] = useState<Source[]>([]);
  const [published, setPublished] = useState(false);
  const [html, setHtml] = useState("");
  const [ready, setReady] = useState(false); // true once ?slug= (if any) has loaded; editor mounts with its content
  const [busy, setBusy] = useState<"" | "draft" | "publish" | "upload">("");
  const [status, setStatus] = useState<{ error?: boolean; text: string }>({ text: "" });
  const [confirm, setConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // derived slug follows the title until the user edits it
  useEffect(() => { if (!slugTouched) setSlug(slugify(title)); }, [title, slugTouched]);

  // load an existing article from ?slug=&section=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("slug");
    const sec = params.get("section") === "explainers" ? "explainers" : "blog";
    if (!s) { setReady(true); return; }
    (async () => {
      try {
        const res = await fetch(`/api/articles?slug=${encodeURIComponent(s)}&section=${sec}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Could not load article");
        const m = data.meta ?? {};
        setTitle(m.title ?? ""); setSlug(s); setSlugTouched(true);
        setSummary(m.summary ?? ""); setTag(Array.isArray(m.tag) ? m.tag.join(", ") : m.tag ?? "");
        setTopics((m.topics ?? []).join(", ")); setImage(m.image ?? "");
        setPublishedAt(String(m.publishedAt ?? "").slice(0, 10) || today());
        setSection(sec); setStorage(data.source === "mongodb" ? "mongodb" : "mdx"); setPublished(!!m.published);
        setSources((Array.isArray(m.sources) ? m.sources : []).map((x: Partial<Source>) => ({ ...blankSource(), ...x, id: crypto.randomUUID(), year: x.year ? String(x.year) : "" })));
        setHtml(markdownToHtml(data.content ?? ""));
      } catch (e) {
        setStatus({ error: true, text: e instanceof Error ? e.message : "Could not load article" });
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const words = useMemo(() => html.replace(/<pre[\s\S]*?<\/pre>/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length, [html]);
  const minutes = Math.max(1, Math.round(words / 220));

  const save = useCallback(async (publish: boolean) => {
    setConfirm(false);
    if (!title.trim()) return setStatus({ error: true, text: "Title is required" });
    const content = htmlToMarkdown(html);
    if (!content.trim()) return setStatus({ error: true, text: "Write something first" });
    setBusy(publish ? "publish" : "draft");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, slug, summary, content, publish, storage, tag, image, publishedAt, section, sources,
          topics: topics.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Save failed");
      setSlug(data.slug); setSlugTouched(true); setPublished(publish);
      setStatus({ text: `${publish ? "Published" : "Saved"} · ${clock()}` });
      if (publish) window.open(`/${section}/${data.slug}`, "_blank", "noopener");
    } catch (e) {
      setStatus({ error: true, text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setBusy("");
    }
  }, [title, slug, summary, html, storage, tag, image, publishedAt, section, topics, sources]);

  // Cmd/Ctrl+S saves a draft
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (!busy) void save(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, busy]);

  const onCoverFile = async (file?: File) => {
    if (!file) return;
    setBusy("upload");
    try { setImage(await uploadImage(file)); setStatus({ text: `Cover uploaded · ${clock()}` }); }
    catch (e) { setStatus({ error: true, text: e instanceof Error ? e.message : "Upload failed" }); }
    finally { setBusy(""); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <span className="eyebrow">Editor · {section === "blog" ? "Writing" : "Explainers"}</span>
          <h1>{title || "New article"}</h1>
        </div>
        <div className={styles.row}>
          {published && slug && <a href={`/${section}/${slug}`} target="_blank" rel="noopener" className={styles.headLink}>View live ↗</a>}
          <Link href="/admin" className={styles.headLink}>Dashboard →</Link>
        </div>
      </div>

      <div className={styles.grid}>
        <div>
          {ready ? (
            <SimpleEditor content={html} onChange={setHtml} onUploadError={(e) => setStatus({ error: true, text: e.message })} />
          ) : (
            <div className={styles.loading}>Loading article…</div>
          )}
        </div>

        <aside className={`card ${styles.panel}`}>
          <div className={styles.field}>
            <label htmlFor="ed-title">Title <span>required</span></label>
            <input id="ed-title" className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A clear, concrete title" />
          </div>
          <div className={styles.field}>
            <label htmlFor="ed-slug">Slug</label>
            <input id="ed-slug" className={`${styles.input} ${styles.mono}`} value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value); }} onBlur={() => setSlug(slugify(slug))} placeholder="auto-from-title" />
          </div>
          <div className={styles.field}>
            <label htmlFor="ed-summary">Summary <span>{summary.length} chars</span></label>
            <textarea id="ed-summary" className={styles.textarea} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One or two sentences. Shows on cards and in search." />
          </div>
          <div className={styles.two}>
            <div className={styles.field}>
              <label htmlFor="ed-tag">Tag</label>
              <input id="ed-tag" className={styles.input} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="LLM Systems" />
            </div>
            <div className={styles.field}>
              <label htmlFor="ed-date">Published</label>
              <input id="ed-date" type="date" className={styles.input} value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="ed-topics">Topics <span>comma separated</span></label>
            <input id="ed-topics" className={styles.input} value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Transformers, Inference" />
          </div>
          <div className={styles.field}>
            <label htmlFor="ed-image">Cover image</label>
            <div className={styles.row}>
              <input id="ed-image" className={`${styles.input} ${styles.mono}`} value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/blog/… or https://" />
              <button type="button" className="btn btnGhost btnSm" disabled={busy === "upload"} onClick={() => fileRef.current?.click()}>
                {busy === "upload" ? "Uploading…" : "Upload"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onCoverFile(e.target.files?.[0])} />
            </div>
            {image && <img src={image} alt="" className={styles.cover} />}
          </div>
          <fieldset className={`${styles.field} ${styles.fieldset}`}>
            <legend>Sources <span>{sources.length ? `${sources.length} listed` : "shown at the end"}</span></legend>
            {sources.map((src, i) => {
              const set = (patch: Partial<Source>) => setSources((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));
              return (
                <div key={src.id} className={styles.source}>
                  <div className={styles.row}>
                    <input className={styles.input} value={src.title} placeholder="Title"
                      aria-label={`Source ${i + 1} title`}
                      onChange={(e) => set({ title: e.target.value })}
                      onPaste={(e) => { const t = e.clipboardData.getData("text").trim(); if (/^https?:\/\/\S+$/.test(t) && !src.url) { e.preventDefault(); set({ url: t }); } }} />
                    <button type="button" className={styles.remove} aria-label={`Remove source ${i + 1}`} onClick={() => setSources((all) => all.filter((_, j) => j !== i))}>×</button>
                  </div>
                  <input className={`${styles.input} ${styles.mono}`} value={src.url} placeholder="https://…" aria-label={`Source ${i + 1} URL`} onChange={(e) => set({ url: e.target.value })} />
                  <div className={styles.two}>
                    <input className={styles.input} value={src.authors} placeholder="Authors (optional)" aria-label={`Source ${i + 1} authors`} onChange={(e) => set({ authors: e.target.value })} />
                    <input className={styles.input} value={src.year} placeholder="Year" inputMode="numeric" aria-label={`Source ${i + 1} year`} onChange={(e) => set({ year: e.target.value })} />
                  </div>
                </div>
              );
            })}
            <button type="button" className="btn btnGhost btnSm" onClick={() => setSources((all) => [...all, blankSource()])}>+ Add source</button>
          </fieldset>
          <div className={styles.two}>
            <div className={styles.field}>
              <label htmlFor="ed-section">Section</label>
              <select id="ed-section" className={styles.select} value={section} onChange={(e) => setSection(e.target.value as Section)}>
                <option value="blog">Writing · /blog</option>
                <option value="explainers">Explainers · /explainers</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="ed-storage">Storage</label>
              <select id="ed-storage" className={styles.select} value={storage} onChange={(e) => setStorage(e.target.value as Storage)}>
                <option value="mdx">MDX file</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>
          </div>

          <div className={styles.stats}>
            <span><b>{words}</b> words</span>
            <span><b>{minutes}</b> min read</span>
          </div>

          {confirm ? (
            <div className={styles.confirm}>
              <span>Publish to <b>/{section}/{slug || "…"}</b>? This writes the post and removes the draft.</span>
              <div className={styles.actions}>
                <button type="button" className="btn btnAccent btnSm" onClick={() => save(true)}>Yes, publish</button>
                <button type="button" className="btn btnGhost btnSm" onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className={styles.actions}>
              <button type="button" className="btn btnGhost btnSm" disabled={!!busy || !ready} onClick={() => save(false)}>
                {busy === "draft" ? "Saving…" : "Save draft"}
              </button>
              <button type="button" className="btn btnPrimary btnSm" disabled={!!busy || !ready} onClick={() => setConfirm(true)}>
                {busy === "publish" ? "Publishing…" : "Publish"}
              </button>
            </div>
          )}
          <div className={`${styles.status} ${status.error ? styles.error : ""}`} role="status" aria-live="polite">
            {status.text || "⌘S saves a draft"}
          </div>
        </aside>
      </div>
    </div>
  );
}
