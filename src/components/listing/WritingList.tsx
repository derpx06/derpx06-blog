"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SaveButton } from "@/components/article/ArticleReader";
import { Icon } from "@/components/site/icons";
import s from "./listing.module.scss";

export type ListItem = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  date: string;
  dateLabel: string;
  tag: string;
  topics: string[];
  minutes: number;
  image: string | null;
  kind: "article" | "explainer";
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) => `${MONTHS[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;

export const matches = (it: ListItem, q: string) =>
  !q || [it.title, it.summary, it.tag, ...it.topics].join(" ").toLowerCase().includes(q.toLowerCase());

/** Distinct values in first-seen order with counts, prefixed by "All". */
export function tabsOf(items: ListItem[], pick: (it: ListItem) => string) {
  const counts = new Map<string, number>();
  for (const it of items) { const k = pick(it); if (k) counts.set(k, (counts.get(k) ?? 0) + 1); }
  return [["All", items.length] as const, ...counts];
}

export function Tabs({ tabs, value, onChange, label }: { tabs: ReadonlyArray<readonly [string, number]>; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className={s.tabs} role="group" aria-label={label}>
      {tabs.map(([k, n]) => (
        <button key={k} type="button" className={s.tab} aria-pressed={value === k} onClick={() => onChange(k)}>
          {k}<span>{n}</span>
        </button>
      ))}
    </div>
  );
}

export function GridCard({ it, foot }: { it: ListItem; foot: React.ReactNode }) {
  const save = { kind: it.kind, slug: it.slug, title: it.title, href: it.href, meta: it.dateLabel };
  return (
    <article className={`card ${s.gridCard}`}>
      <div className={s.gridMedia}>
        {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span className={s.initial} aria-hidden="true">{it.title[0]}</span>}
        <span className={s.floatSave}><SaveButton item={save} compact /></span>
      </div>
      <div className={s.gridBody}>
        <span className="eyebrow">{[it.tag, it.dateLabel].filter(Boolean).join(" · ")}</span>
        <Link href={it.href} className={s.gridTitle}>{it.title}</Link>
        <p className={s.gridSummary}>{it.summary}</p>
      </div>
      <div className={s.gridFoot}>{foot}</div>
    </article>
  );
}

export function WritingList({ items }: { items: ListItem[] }) {
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
    for (const it of shown) { const k = monthKey(it.date); m.set(k, [...(m.get(k) ?? []), it]); }
    return [...m];
  }, [shown]);

  return (
    <>
      <section className={`hero ${s.hero}`}>
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
              <div className={s.seg} role="group" aria-label="View">
                {(["timeline", "grid"] as const).map((v) => (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>{v === "timeline" ? "Timeline" : "Grid"}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <h2>{MONTHS[Number(k.slice(5, 7)) - 1]} <span className="mono">{k.slice(0, 4)}</span></h2>
                <span className="mono">{posts.length} {posts.length === 1 ? "essay" : "essays"}</span>
              </header>
              {posts.map((it) => {
                const d = new Date(it.date);
                return (
                  <article key={it.slug} className={s.row}>
                    <div className={s.day}>
                      <b>{d.getUTCDate()}</b>
                      <span className="mono">{MONTHS[d.getUTCMonth()].slice(0, 3)}</span>
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
                      {it.image ? <img src={it.image} alt="" loading="lazy" /> : <span className={s.initial}>{it.title[0]}</span>}
                    </div>
                    <div className={s.rowSave}><SaveButton item={{ kind: it.kind, slug: it.slug, title: it.title, href: it.href, meta: it.dateLabel }} compact /></div>
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
