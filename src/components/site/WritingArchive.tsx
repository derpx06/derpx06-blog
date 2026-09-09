"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Piece } from "@/lib/site-data";
import { SaveButton } from "./SaveButton";

type Sort = "newest" | "oldest" | "longest";

const SORTS: Array<{ key: Sort; label: string }> = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "longest", label: "Longest" },
];

function shortDate(value: string) {
  if (!value) return "";
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

/**
 * The whole archive is server-rendered into props, so filtering is instant and
 * costs no round trip — and the full list is still in the HTML for crawlers.
 */
export function WritingArchive({
  pieces,
  tags,
}: {
  pieces: Piece[];
  tags: Array<{ tag: string; count: number }>;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("newest");
  const searchRef = useRef<HTMLInputElement>(null);

  // Read on mount rather than via useSearchParams, so the whole archive is
  // server-rendered into the HTML instead of hiding behind a Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialTag = params.get("tag");
    if (initialTag) setTag(initialTag);
    if (params.get("search")) searchRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = pieces.filter((piece) => {
      if (tag && piece.tag !== tag) return false;
      if (!needle) return true;
      return `${piece.title} ${piece.summary} ${piece.tag}`.toLowerCase().includes(needle);
    });

    const sorted = [...matched];
    if (sort === "oldest") sorted.reverse();
    if (sort === "longest") sorted.sort((a, b) => b.minutes - a.minutes);
    return sorted;
  }, [pieces, query, tag, sort]);

  const groups = useMemo(() => {
    const map = new Map<number, Piece[]>();
    for (const piece of filtered) {
      const bucket = map.get(piece.year);
      if (bucket) bucket.push(piece);
      else map.set(piece.year, [piece]);
    }
    const entries = [...map.entries()].map(([year, items]) => ({ year, items }));
    return sort === "oldest"
      ? entries.sort((a, b) => a.year - b.year)
      : entries.sort((a, b) => b.year - a.year);
  }, [filtered, sort]);

  let counter = 0;

  return (
    <>
      <search style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
        <label className="ds-sr" htmlFor="archive-search">
          Search writing
        </label>
        <input
          id="archive-search"
          ref={searchRef}
          className="ds-field"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, tags and notes…"
          style={{ minWidth: 300 }}
        />
        <button
          type="button"
          className={`ds-box${tag === null ? " ds-dark" : ""}`}
          onClick={() => setTag(null)}
        >
          All {pieces.length}
        </button>
        {tags.map((entry) => (
          <button
            key={entry.tag}
            type="button"
            className={`ds-box${tag === entry.tag ? " ds-dark" : ""}`}
            onClick={() => setTag(tag === entry.tag ? null : entry.tag)}
          >
            {entry.tag} {entry.count}
          </button>
        ))}
        <label className="ds-sr" htmlFor="archive-sort">
          Sort
        </label>
        <span className="ds-select">
          <select
            id="archive-sort"
            className="ds-box ds-quiet"
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
      </search>

      {filtered.length === 0 && (
        <p className="ds-dek" style={{ marginTop: 34 }}>
          Nothing matches that yet. Try a different tag or search.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.year}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "22px 0 4px" }}>
            <h2 className="ds-ser" style={{ fontSize: 22, color: "var(--mut)", margin: 0 }}>
              {group.year || "Undated"}
            </h2>
            <div className="ds-rule" style={{ flex: 1 }} />
            <span className="ds-meta ds-meta-s">
              {group.items.length} {group.items.length === 1 ? "piece" : "pieces"}
            </span>
          </div>

          <div className="ds-stack">
            {group.items.map((piece, index) => {
              counter += 1;
              const last = index === group.items.length - 1;
              return (
                <article
                  key={piece.slug}
                  className="ds-item"
                  style={{
                    padding: "18px 0",
                    alignItems: "baseline",
                    borderBottom: last ? "1px solid var(--rule)" : undefined,
                  }}
                >
                  <span className="ds-num" style={{ width: 24 }}>
                    {String(counter).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="ds-t-m" style={{ marginBottom: 6 }}>
                      <Link href={piece.href} className="ds-plain-link">
                        {piece.title}
                      </Link>
                    </h3>
                    <p className="ds-dek" style={{ fontSize: 14, maxWidth: "62ch" }}>
                      {piece.summary}
                    </p>
                  </div>
                  <div className="ds-archive-meta">
                    <span className="ds-kick">{piece.tag}</span>
                    <span className="ds-meta ds-meta-s">
                      {shortDate(piece.publishedAt)} · {piece.minutes} min
                    </span>
                    <SaveButton
                      variant="italic"
                      piece={{
                        slug: piece.slug,
                        href: piece.href,
                        title: piece.title,
                        minutes: piece.minutes,
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
