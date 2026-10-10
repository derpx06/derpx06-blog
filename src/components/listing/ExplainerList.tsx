"use client";

import { useMemo, useState } from "react";
import { GridCard, Tabs, matches, monthKey, monthLabel, tabsOf, type ListItem } from "./WritingList";
import { HeroFx } from "@/components/site/HeroFx";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import s from "./listing.module.scss";

export function ExplainerList({ items }: { items: ListItem[] }) {
  const [month, setMonth] = useState("All");
  const [tag, setTag] = useState("All");

  const months = useMemo(() => tabsOf(items, (it) => monthKey(it.date)), [items]);
  const tags = useMemo(() => tabsOf(items, (it) => it.tag), [items]);
  const shown = items.filter((it) => (month === "All" || monthKey(it.date) === month) && (tag === "All" || it.tag === tag));

  return (
    <>
      <HeroFx className={`hero ${s.hero} ${s.exHero}`}>
        <HeroBackdrop />
        <div className="wrap">
          <span className={`eyebrow ${s.status}`}><span className={s.dot} />Paper explainers · {items.length} published</span>
          <h1 className={s.exH1}>
            <span className={s.serif}>Landmark AI papers, made</span>
            <span className={s.pixel}>simple to understand</span>
          </h1>
          <p className={`lede ${s.lede}`}>No prerequisites beyond curiosity. Each walkthrough ends with the paper&apos;s own numbers.</p>
          <div className={s.pills} role="group" aria-label="Filter by month">
            {months.map(([k, n]) => (
              <button key={k} type="button" className="pill" aria-pressed={month === k} onClick={() => setMonth(k)}>
                {k === "All" ? "All" : monthLabel(k)}<span className={s.badge}>{n}</span>
              </button>
            ))}
          </div>
        </div>
      </HeroFx>

      <div className={`wrap ${s.main} ${s.exMain}`}>
        <div className={s.domainRow}>
          <Tabs tabs={tags} value={tag} onChange={setTag} label="Filter by domain" />
          <span className={`mono ${s.count}`} aria-live="polite">{shown.length} of {items.length}</span>
        </div>
        {shown.length === 0 ? (
          <div className={`card ${s.empty}`}>
            <b>Nothing published for that filter yet.</b>
            <div className={s.emptyBtns}>
              <button type="button" className="btnGhost btnSm" onClick={() => { setMonth("All"); setTag("All"); }}>Clear</button>
            </div>
          </div>
        ) : (
          <div className={s.grid}>
            {shown.map((it) => (
              <GridCard key={it.slug} it={it} foot={<><span className="mono">{it.dateLabel}</span>{it.tag && <span className="tag">{it.tag}</span>}</>} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
