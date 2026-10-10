"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminEdit } from "@/components/site/AdminEdit";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { HeroFx } from "@/components/site/HeroFx";
import { Icon } from "@/components/site/icons";
import type { Piece } from "@/lib/pieces";
import { formatShortDate } from "@/lib/pieces";
import { SaveIcon } from "./SaveIcon";
import s from "./listing.module.scss";

/** A `Piece` whose image has already been through `resolveImage` on the server. */
export type ListItem = Omit<Piece, "image"> & { image: string | null };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) => `${MONTHS[Number(key.slice(5, 7)) - 1] ?? ""} ${key.slice(0, 4)}`.trim();

export const matches = (it: ListItem, q: string) =>
  !q || [it.title, it.summary, it.tag].join(" ").toLowerCase().includes(q.toLowerCase());

/** Distinct values in first-seen order with counts, prefixed by "All". */
export function tabsOf(items: ListItem[], pick: (it: ListItem) => string) {
  const counts = new Map<string, number>();
  for (const it of items) { const k = pick(it); if (k) counts.set(k, (counts.get(k) ?? 0) + 1); }
  return [["All", items.length] as const, ...counts];
}

export function Tabs({ tabs, value, onChange, label }: { tabs: ReadonlyArray<readonly [string, number]>; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <fieldset className={s.tabs} aria-label={label}>
      {tabs.map(([k, n]) => (
        <button key={k} type="button" className={s.tab} aria-pressed={value === k} onClick={() => onChange(k)}>
          {k}<span>{n}</span>
        </button>
      ))}
    </fieldset>
  );
}

export const saveTarget = (it: ListItem) => ({ slug: it.slug, href: it.href, title: it.title, minutes: it.minutes });

export function GridCard({ it, foot }: { it: ListItem; foot: React.ReactNode }) {
  const date = formatShortDate(it.publishedAt);
  return (
    <article className={`card ${s.gridCard}`}>
      <div className={s.gridMedia}>
        {/* biome-ignore lint/performance/noImgElement: SVG diagrams, object-fit contain */}
        {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span className={s.initial} aria-hidden="true">{it.title[0]}</span>}
        <span className={s.floatSave}><SaveIcon piece={saveTarget(it)} /></span>
      </div>
      <div className={s.gridBody}>
        <span className="eyebrow">{[it.tag, date].filter(Boolean).join(" · ")}</span>
        <Link href={it.href} className={s.gridTitle}>{it.title}</Link>
        <p className={s.gridSummary}>{it.summary}</p>
      </div>
      <div className={s.gridFoot}>{foot}</div>
    </article>
  );
}

export function WritingList({ items, adminHref }: { items: ListItem[]; adminHref?: string }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("All");
  const [view, setView] = useState<"timeline" | "grid">("timeline");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(el?.tagName ?? "") && !el?.isContentEditable) { e.preventDefault(); input.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const tabs = useMemo(() => tabsOf(items, (it) => it.tag), [items]);
  const shown = items.filter((it) => (tag === "All" || it.tag === tag) && matches(it, q));
  const newest = items[0]?.slug;

  const groups = useMemo(() => {
    const m = new Map<string, ListItem[]>();
    for (const it of shown) { const k = monthKey(it.publishedAt); m.set(k, [...(m.get(k) ?? []), it]); }
    return [...m];
  }, [shown]);

  return (
    <>
      <HeroFx className={`hero ${s.hero}`}>
        <HeroBackdrop />
        <div className={`wrap ${s.heroInner}`}>
          <h1 className={s.h1}>The things I got wrong, written down.</h1>
          <p className={`lede ${s.lede}`}>Long-form essays on distributed systems, retrieval and AI plumbing. Each one starts from a bug I shipped or a belief I had to drop.</p>
          <div className={`card ${s.panel}`}>
            <label className={s.search}>
              <Icon name="search" size={16} />
              <span className="srOnly">Search essays</span>
              <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search essays" />
              <kbd>/</kbd>
            </label>
            <Tabs tabs={tabs} value={tag} onChange={setTag} label="Filter by topic" />
            <div className={s.panelFoot}>
              <span className={`mono ${s.count}`} aria-live="polite">{shown.length} {shown.length === 1 ? "match" : "matches"}</span>
              <fieldset className={s.seg} aria-label="View">
                {(["timeline", "grid"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>{v === "timeline" ? "Timeline" : "Grid"}</button>
                ))}
              </fieldset>
              {adminHref && <AdminEdit href={adminHref} variant="mini" />}
            </div>
          </div>
        </div>
      </HeroFx>

      <div className={`wrap ${s.main}`}>
        {shown.length === 0 ? (
          <div className={`card ${s.empty}`}>
            <b>Nothing matches &ldquo;{q || tag}&rdquo;.</b>
            <div className={s.emptyBtns}>
              <button type="button" className="btnGhost btnSm" onClick={() => { setQ(""); setTag("All"); }}>Clear</button>
              <Link href="/explainers" className={s.emptyLink}>Search explainers →</Link>
            </div>
          </div>
        ) : view === "grid" ? (
          <div className={s.grid}>
            {shown.map((it) => <GridCard key={it.slug} it={it} foot={<span className="mono">{it.minutes} min read</span>} />)}
          </div>
        ) : (
          groups.map(([k, posts]) => (
            <section key={k} className={s.month}>
              <header className={s.monthHead}>
                <h2>{MONTHS[Number(k.slice(5, 7)) - 1] ?? "Undated"} <span className="mono">{k.slice(0, 4)}</span></h2>
                <span className="mono">{posts.length} {posts.length === 1 ? "essay" : "essays"}</span>
              </header>
              {posts.map((it) => {
                const d = new Date(it.publishedAt);
                const dated = !Number.isNaN(d.getTime());
                return (
                  <article key={it.slug} className={s.row}>
                    <div className={s.day}>
                      <b>{dated ? d.getUTCDate() : "—"}</b>
                      <span className="mono">{dated ? MONTHS[d.getUTCMonth()].slice(0, 3) : ""}</span>
                    </div>
                    <Link href={it.href} className={s.rowBody}>
                      <span className={s.rowMeta}>
                        <span className="eyebrow">{[it.tag, `${it.minutes} min read`].filter(Boolean).join(" · ")}</span>
                        {it.slug === newest && <span className={s.new}>New</span>}
                      </span>
                      <span className={s.rowTitle}>{it.title}</span>
                      <span className={s.rowSummary}>{it.summary}</span>
                    </Link>
                    <div className={s.thumb} aria-hidden="true">
                      {/* biome-ignore lint/performance/noImgElement: SVG diagrams, object-fit contain */}
        {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span className={s.initial}>{it.title[0]}</span>}
                    </div>
                    <div className={s.rowSave}><SaveIcon piece={saveTarget(it)} /></div>
                  </article>
                );
              })}
            </section>
          ))
        )}

        <div className={s.ctas}>
          <Link href="/explainers" className={`darkCard ${s.cta}`}>
            <span className="glow" aria-hidden="true" />
            <span className="eyebrow">Next</span>
            <b>Paper explainers →</b>
            <span>Landmark papers, walked through without the jargon.</span>
          </Link>
          <Link href="/about" className={`${s.cta} ${s.ctaAccent}`}>
            <span className="eyebrow">Who writes this</span>
            <b>About me →</b>
            <span>What I build, where I have shipped, how to reach me.</span>
          </Link>
        </div>
      </div>
    </>
  );
}
