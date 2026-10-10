"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./home.module.scss";

type Rot = { text: string; label: string; href: string; img?: string };
const ROT: Rot[] = [
  { text: "how KV caches work.", label: "KV cache", href: "/blog/kv-cache-from-first-principles", img: "/images/blog/image.png" },
  { text: "how attention works.", label: "Attention", href: "/explainers/attention-is-all-you-need", img: "/images/explainers/attention-is-all-you-need-1.png" },
  { text: "what R1 changed.", label: "Reasoning", href: "/explainers/deepseek-r1", img: "/images/explainers/deepseek-r1/coverImage.png" },
  { text: "how JEPA sees.", label: "Vision", href: "/explainers/jepa-architecture", img: "/images/explainers/jepa/vl-jepa-architecture.png" },
  { text: "why retries need idempotency.", label: "Reliability", href: "/learn/langchain-mastery/handling-llm-errors" },
  { text: "how retrieval really works.", label: "Retrieval", href: "/learn/langchain-mastery/retriever-interface" },
  { text: "what agents need.", label: "Agents", href: "/learn/langchain-mastery/react-agents" },
  { text: "how to fine-tune.", label: "Fine-tuning", href: "/learn/finetuning-an-llm" },
];
// Floating tiles around the headline (desktop). `rot` ties a tile to a phrase; `d` is parallax depth.
const TILES = [
  { rot: 0, label: "LLMs · KV cache", pos: { left: "5%", top: "150px" }, r: -6, d: -34 },
  { rot: 1, label: "Papers · Attention", pos: { right: "5%", top: "140px" }, r: 5, d: -28 },
  { rot: 2, label: "Reasoning · R1", pos: { left: "9%", bottom: "44px" }, r: 4, d: 22 },
  { rot: 3, label: "Vision · JEPA", pos: { right: "9%", bottom: "40px" }, r: -5, d: 26 },
];

const ROT_MS = 3200;

/** "Figuring out <concept>." — the concept rotates on a progress-bar timer; each one links to the piece about it.
    Tiles around the headline highlight the matching piece and are always clickable. */
export function HomeHero({ newest }: { newest: { href: string; title: string } | null }) {
  const [rot, setRot] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const go = (i: number) => { setPrev(rot); setRot(((i % ROT.length) + ROT.length) % ROT.length); setTick((t) => t + 1); };
  const goRef = useRef(go); goRef.current = go;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync(); mq.addEventListener("change", sync);
    const onKey = (e: KeyboardEvent) => {
      if (/input|textarea|select/i.test((document.activeElement as HTMLElement)?.tagName || "")) return;
      if (e.key === "ArrowRight") goRef.current(rot + 1); else if (e.key === "ArrowLeft") goRef.current(rot - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => { mq.removeEventListener("change", sync); window.removeEventListener("keydown", onKey); };
  }, [rot]);

  // reduced motion: no bar animation, so advance on a plain timer instead
  useEffect(() => {
    if (!reduced || paused) return;
    const id = setInterval(() => goRef.current(rot + 1), ROT_MS);
    return () => clearInterval(id);
  }, [reduced, paused, rot]);

  const cur = ROT[rot];
  return (
    <>
      {TILES.map((t) => {
        const r = ROT[t.rot]; const on = t.rot === rot;
        return (
          <Link
            key={t.label}
            href={r.href}
            aria-label={`${t.label}: ${r.text}`}
            className={classNames(styles.tile, on && styles.tileOn)}
            style={{ ...t.pos, transform: `translate(calc(var(--px, 0) * ${t.d}px), calc(var(--py, 0) * ${t.d}px)) rotate(${t.r}deg) scale(${on ? 1.06 : 1})` }}
            onMouseEnter={() => { setPaused(true); if (!on) go(t.rot); }}
            onMouseLeave={() => setPaused(false)}
          >
            <span className={styles.tileImg} style={{ backgroundImage: r.img ? `url(${r.img})` : undefined }} />
            <span className={styles.tileLabel}>{t.label}</span>
          </Link>
        );
      })}

      <div className={`wrap ${styles.heroInner}`}>
        <span className={styles.status}><span className={styles.statusDot} />Learning systems &amp; AI in public</span>
        <h1 className={styles.h1} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <span>Figuring out</span>
          <span className={styles.rotator}>
            {prev !== null && tick > 0 && !reduced && <span key={`o${tick}`} aria-hidden="true" className={styles.wordOut}>{ROT[prev].text}</span>}
            <Link key={`r${tick}`} href={cur.href} className={classNames(styles.wordLink, tick > 0 && !reduced && styles.wordIn)}>{cur.text}</Link>
          </span>
        </h1>
        <div className={styles.tabs} role="tablist" aria-label="Topics">
          {ROT.map((r, i) => (
            <button key={r.label} type="button" role="tab" aria-selected={i === rot} aria-label={r.label} className={classNames(styles.tab, i === rot && styles.tabOn)} onClick={() => go(i)}>
              <span className={styles.track}>
                <span
                  key={`f${tick}-${i}`}
                  className={classNames(styles.fill, i < rot && styles.fillDone, i === rot && !reduced && styles.fillRun)}
                  style={{ animationDuration: `${ROT_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
                  onAnimationEnd={i === rot ? () => go(rot + 1) : undefined}
                />
              </span>
            </button>
          ))}
        </div>
        <p className={styles.heroLede}>Notes from learning system design, distributed systems and AI — what I got wrong, and what finally made it click.</p>
        <div className={styles.actions}>
          <Link className="btnPrimary" href="/explainers">Start with an explainer <span className={styles.arrow}>→</span></Link>
          <Link className="btnGhost" href="/learn">Notes</Link>
        </div>
        {cur.img && (
          <Link href={cur.href} className={styles.mCard} aria-label={`${cur.label}: ${cur.text}`}>
            <span key={rot} className={classNames(styles.tileImg, !reduced && styles.wordIn)} style={{ backgroundImage: `url(${cur.img})`, height: 120 }} />
            <span className={styles.tileLabel}>{cur.label} · {cur.text}</span>
          </Link>
        )}
        {newest && (
          <Link className={styles.latestLink} href={newest.href}>
            <span className={styles.latestKicker}>Latest</span><span className={styles.latestRule} />{newest.title} →
          </Link>
        )}
      </div>
    </>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onClick = async () => {
    try { await navigator.clipboard?.writeText(email); } catch {}
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" className={styles.copyBtn} onClick={onClick} aria-label="Copy email address">
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
