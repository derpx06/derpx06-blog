"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/site/toast";
import type { ContentSection, ContentStatus } from "@/types/content.types";
import { MdxCanvas } from "./MdxCanvas";

/**
 * The article editor: one WYSIWYG canvas over the real MDX, and nothing else.
 *
 * The canvas is the preview — every custom component is an editable block
 * rather than a tag you type, and the body is styled with the same `ds-prose`
 * classes the published article uses, so there is nothing to compare against.
 * The signed-token preview still exists behind "Preview ↗" for the one thing a
 * canvas cannot show: the finished article template, running the real server
 * components with shiki and KaTeX.
 *
 * There is no source view. Formatting is the selection bubble, inserting is the
 * `+` in the margin — both in `MdxFloatingTools.tsx`. What used to force a body
 * into a raw textarea was the parser eating two spaces per save from multi-line
 * JSX attributes; `src/lib/mdx-jsx-indent.ts` fixes that at the root, so every
 * document is now editable visually.
 */

export type EditorRecord = {
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  body: string;
  bodyFormat: "mdx" | "html";
  status: ContentStatus;
  tag: string;
  topics: string[];
  image: string;
  link: string;
  publishedAt: string;
};

type Problem = { rule: string; detail: string; severity: "error" | "warning" };

const SECTIONS: ContentSection[] = ["blog", "explainers", "learn", "work"];
const AUTOSAVE_MS = 15000;

export function ContentEditor({
  initial,
  isNew = false,
}: {
  initial: EditorRecord;
  isNew?: boolean;
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [record, setRecord] = useState<EditorRecord>(initial);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  // MDXEditor emits several onChange events as it mounts, carrying the body
  // re-serialised through mdast. That is normalisation, not an edit — `npm
  // test` proves it changes nothing a reader sees — and counting the events is
  // guesswork, so "dirty" is driven by the author touching the canvas instead.
  // Otherwise merely opening an article would autosave it and burn a revision.
  const touched = useRef(false);
  // Mirrors state so the autosave timer never closes over a stale record.
  const recordRef = useRef(record);
  recordRef.current = record;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // A freshly opened article has not been edited yet, whatever MDXEditor emits
  // while it mounts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: the opening body is the input, deliberately
  useEffect(() => {
    touched.current = false;
  }, [initial.slug]);

  const set = useCallback(<K extends keyof EditorRecord>(key: K, value: EditorRecord[K]) => {
    setRecord((current) => ({ ...current, [key]: value }));
    setDirty(true);
  }, []);

  /* ------------------------------------------------------------- checking */

  // Debounced linting, re-run whenever anything the rules read changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reads recordRef so the timer sees the latest draft; the deps are the fields that should retrigger it
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/admin/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recordRef.current),
        });
        if (!response.ok) return;
        setProblems((await response.json()).problems ?? []);
      } catch {
        // Linting is advisory; a failed check must not interrupt writing.
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [record.body, record.title, record.summary, record.tag, record.image, record.section]);

  /* --------------------------------------------------------------- saving */

  const save = useCallback(
    async (options: { silent?: boolean } = {}) => {
      const current = recordRef.current;
      if (!current.title.trim()) {
        if (!options.silent) addToast({ variant: "danger", message: "Give it a title first." });
        return null;
      }

      setSaving(true);
      try {
        const created = isNew && !savedAt;
        const response = await fetch(
          created ? "/api/admin/content" : `/api/admin/content/${current.section}/${current.slug}`,
          {
            method: created ? "POST" : "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(current),
          },
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save");

        setDirty(false);
        setSavedAt(new Date().toISOString());
        if (!options.silent) addToast({ variant: "success", message: "Saved." });

        const slug = data.record?.slug;
        if (created && slug) {
          router.replace(`/admin/content/${current.section}/${slug}`);
        }
        return data.record;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save";
        addToast({ variant: "danger", message });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [addToast, isNew, router, savedAt],
  );

  // Autosave. Only fires when there is something to save, so an idle tab is quiet.
  useEffect(() => {
    const timer = setInterval(() => {
      if (dirtyRef.current && recordRef.current.title.trim()) void save({ silent: true });
    }, AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, [save]);

  // Closing with unsaved work should ask first.
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  /* -------------------------------------------------------------- preview */

  const refreshPreview = useCallback(async () => {
    const current = recordRef.current;
    if (dirtyRef.current) await save({ silent: true });

    try {
      const response = await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: current.section, slug: current.slug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not build a preview");
      // The query string busts the iframe cache without remounting it.
      setPreviewUrl(`${data.url}?t=${Date.now()}`);
    } catch (error) {
      addToast({
        variant: "danger",
        message: error instanceof Error ? error.message : "Preview failed",
      });
    }
  }, [addToast, save]);

  /** Saves, mints a fresh signed token, and shows the real article full screen. */
  const openPreview = useCallback(async () => {
    setPreviewOpen(true);
    await refreshPreview();
  }, [refreshPreview]);

  /* ------------------------------------------------------------ publishing */

  const setStatus = useCallback(
    async (status: ContentStatus, force = false) => {
      if (dirtyRef.current) await save({ silent: true });
      const current = recordRef.current;

      try {
        const response = await fetch(
          `/api/admin/content/${current.section}/${current.slug}/status`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, force }),
          },
        );
        const data = await response.json();

        if (response.status === 422) {
          setProblems(data.problems ?? []);
          addToast({
            variant: "danger",
            message: `${data.problems?.length ?? 0} thing(s) to fix before publishing.`,
          });
          return;
        }
        if (!response.ok) throw new Error(data.error || "Could not change status");

        setRecord((c) => ({ ...c, status }));
        addToast({ variant: "success", message: `Now ${status}.` });
        router.refresh();
      } catch (error) {
        addToast({
          variant: "danger",
          message: error instanceof Error ? error.message : "Could not change status",
        });
      }
    },
    [addToast, router, save],
  );

  /* ---------------------------------------------------------------- typing */

  const onBodyChange = useCallback((body: string) => {
    setRecord((current) => (current.body === body ? current : { ...current, body }));
    if (touched.current) setDirty(true);
  }, []);

  /** Uploads an image the canvas asks us to store, and hands back its URL. */
  const uploadImage = useCallback(async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok || !data.url) throw new Error(data.message || "Upload failed");
    return data.url as string;
  }, []);

  const errors = problems.filter((problem) => problem.severity === "error");

  return (
    <div className="ds-editor-shell">
      <div className="ds-editor-col">
        {/* One bar for the whole editor: what this piece is, and what you can
            do to it. Everything about *writing* lives in the canvas itself. */}
        <div className="ds-editor-colhead">
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`ds-badge ds-badge-${record.status}`}>{record.status}</span>
            <span>{dirty ? "unsaved" : savedAt ? "saved" : ""}</span>
          </span>
          <span style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="ds-mini"
              aria-expanded={showMeta}
              onClick={() => setShowMeta((current) => !current)}
            >
              Details
            </button>
            <button type="button" className="ds-mini" onClick={openPreview}>
              Preview
            </button>
            <button type="button" className="ds-mini" onClick={() => save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            {record.status !== "published" ? (
              <button
                type="button"
                className="ds-mini"
                onClick={() => setStatus("published")}
                disabled={saving || errors.length > 0}
                title={errors.length > 0 ? "Fix the errors below first" : undefined}
              >
                Publish
              </button>
            ) : (
              <button type="button" className="ds-mini" onClick={() => setStatus("draft")}>
                Unpublish
              </button>
            )}
          </span>
        </div>

        {/* The slug, tag and image are edited once and then never again, so
            they drop down over the canvas rather than taking a column from it. */}
        {showMeta && (
          <div className="ds-editor-meta">
            <MetadataFields record={record} set={set} isNew={isNew} />
          </div>
        )}

        {/* Capture-only listeners: they mark author intent, they do not act. */}
        <div
          className="ds-mdx-host"
          onKeyDownCapture={() => {
            touched.current = true;
          }}
          onPointerDownCapture={() => {
            touched.current = true;
          }}
          onPasteCapture={() => {
            touched.current = true;
          }}
        >
          <MdxCanvas value={record.body} onChange={onBodyChange} onUploadImage={uploadImage} />
        </div>

        {problems.length > 0 && (
          <div
            className="ds-editor-scroll"
            style={{ flex: "none", maxHeight: 190, borderTop: "1px solid var(--rule)" }}
          >
            <div className="ds-checks">
              {problems.map((problem) => (
                <div
                  key={`${problem.rule}-${problem.detail}`}
                  className={`ds-check${problem.severity === "error" ? " ds-check-error" : ""}`}
                >
                  <code>{problem.rule}</code>
                  <span>{problem.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {previewOpen && (
        <div className="ds-preview-overlay" role="dialog" aria-label="Article preview">
          <div className="ds-preview-bar">
            <span>Preview — the real article template</span>
            <span style={{ display: "flex", gap: 6 }}>
              <button type="button" className="ds-mini" onClick={() => void refreshPreview()}>
                Refresh
              </button>
              {previewUrl && (
                <Link
                  className="ds-mini"
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open ↗
                </Link>
              )}
              <button type="button" className="ds-mini" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </span>
          </div>
          {previewUrl ? (
            <iframe className="ds-preview-frame" src={previewUrl} title="Article preview" />
          ) : (
            <div className="ds-editor-scroll">
              <p className="ds-meta ds-meta-s">Saving the draft, then rendering it…</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- fields */

function MetadataFields({
  record,
  set,
  isNew,
}: {
  record: EditorRecord;
  set: <K extends keyof EditorRecord>(key: K, value: EditorRecord[K]) => void;
  isNew: boolean;
}) {
  return (
    <>
      <div className="ds-field-row">
        <label htmlFor="f-title">Title</label>
        <input
          id="f-title"
          className="ds-field"
          value={record.title}
          onChange={(event) => set("title", event.target.value)}
          style={{ flex: "none" }}
        />
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-section">Section</label>
        <select
          id="f-section"
          className="ds-field"
          value={record.section}
          disabled={!isNew}
          onChange={(event) => set("section", event.target.value as ContentSection)}
          style={{ flex: "none" }}
        >
          {SECTIONS.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
        {!isNew && <span className="ds-field-hint">Move it from the content list.</span>}
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-slug">Slug</label>
        <input
          id="f-slug"
          className="ds-field"
          value={record.slug}
          disabled={!isNew}
          onChange={(event) => set("slug", event.target.value)}
          placeholder="from the title"
          style={{ flex: "none" }}
        />
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-summary">Summary</label>
        <textarea
          id="f-summary"
          className="ds-field"
          value={record.summary}
          onChange={(event) => set("summary", event.target.value)}
        />
        <span className="ds-field-hint">The dek, and the archive row.</span>
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-tag">Tag</label>
        <input
          id="f-tag"
          className="ds-field"
          value={record.tag}
          onChange={(event) => set("tag", event.target.value)}
          placeholder="Systems"
          style={{ flex: "none" }}
        />
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-image">Cover image</label>
        <input
          id="f-image"
          className="ds-field"
          value={record.image}
          onChange={(event) => set("image", event.target.value)}
          placeholder="/images/…"
          style={{ flex: "none" }}
        />
        <span className="ds-field-hint">Must exist on disk, or crawlers get a 404.</span>
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-topics">Topics</label>
        <input
          id="f-topics"
          className="ds-field"
          value={record.topics.join(", ")}
          onChange={(event) =>
            set(
              "topics",
              event.target.value
                .split(",")
                .map((topic) => topic.trim())
                .filter(Boolean),
            )
          }
          placeholder="comma, separated"
          style={{ flex: "none" }}
        />
      </div>

      <div className="ds-field-row">
        <label htmlFor="f-published">Published date</label>
        <input
          id="f-published"
          className="ds-field"
          type="date"
          value={record.publishedAt ? record.publishedAt.slice(0, 10) : ""}
          onChange={(event) =>
            set("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : "")
          }
          style={{ flex: "none" }}
        />
        <span className="ds-field-hint">Nothing filters on date — a future date is live now.</span>
      </div>
    </>
  );
}
