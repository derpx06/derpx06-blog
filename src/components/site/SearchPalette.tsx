"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchDoc } from "@/app/api/search/route";

const KINDS: Array<SearchDoc["kind"]> = ["Writing", "Explainer", "Course", "Lesson"];

/** Fields are weighted so a title hit always outranks a body mention. */
function score(doc: SearchDoc, needle: string): number {
  const title = doc.title.toLowerCase();
  if (title === needle) return 100;
  if (title.startsWith(needle)) return 80;
  if (title.includes(needle)) return 60;
  if (doc.summary.toLowerCase().includes(needle)) return 30;
  if (doc.meta.toLowerCase().includes(needle)) return 20;
  return 0;
}

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: closing on every path change is the point
  useEffect(close, [pathname, close]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);

    window.addEventListener("keydown", onKey);
    window.addEventListener("derpx06:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("derpx06:search", onOpen);
    };
  }, []);

  // Index is fetched once, the first time the palette is opened.
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    if (docs) return;
    fetch("/api/search")
      .then((response) => response.json())
      .then((data) => setDocs(data.docs ?? []))
      .catch(() => setDocs([]));
  }, [open, docs]);

  // Lock the page behind the palette.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    if (!docs) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return docs.slice(0, 8);
    return docs
      .map((doc) => ({ doc, rank: score(doc, needle) }))
      .filter((entry) => entry.rank > 0)
      .sort((a, b) => b.rank - a.rank || KINDS.indexOf(a.doc.kind) - KINDS.indexOf(b.doc.kind))
      .slice(0, 30)
      .map((entry) => entry.doc);
  }, [docs, query]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the cursor on a new query
  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(value + 1, results.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && results[cursor]) {
      window.location.assign(results[cursor].href);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: the dialog inside owns focus; this is the click-away layer
    <div
      className="ds-palette-backdrop"
      role="presentation"
      // Only a click on the backdrop itself closes; clicks inside the dialog bubble
      // up to here but carry a different target.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="ds-palette" role="dialog" aria-modal="true" aria-label="Search">
        <div className="ds-palette-field">
          <label className="ds-sr" htmlFor="palette-input">
            Search everything
          </label>
          <input
            id="palette-input"
            ref={input}
            className="ds-field"
            type="search"
            value={query}
            placeholder="Search writing, explainers, courses and lessons…"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="ds-box" onClick={close}>
            Esc
          </button>
        </div>

        <div className="ds-palette-results">
          {docs === null && <p className="ds-meta ds-palette-empty">Loading the index…</p>}
          {docs !== null && results.length === 0 && (
            <p className="ds-meta ds-palette-empty">Nothing matches “{query}”.</p>
          )}
          {results.map((doc, index) => (
            <Link
              key={doc.href}
              href={doc.href}
              className={`ds-palette-hit${index === cursor ? " on" : ""}`}
              onMouseEnter={() => setCursor(index)}
            >
              <span className="ds-kick ds-palette-kind">{doc.kind}</span>
              <span className="ds-palette-title">{doc.title}</span>
              <span className="ds-meta ds-meta-xs">{doc.meta}</span>
            </Link>
          ))}
        </div>

        <div className="ds-palette-foot ds-meta ds-meta-xs">
          <span>↑↓ to move · ↵ to open · esc to close</span>
          {docs && <span>{docs.length} indexed</span>}
        </div>
      </div>
    </div>
  );
}
