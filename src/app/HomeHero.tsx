"use client";

import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./home.module.scss";

const WORDS = ["retrieval", "inference", "agents", "fine-tuning"];
const EVERY = 2600;

/** h1 "Figuring out <word>" + tab dots. Rotates words, pauses on hover, static under reduced motion. */
export function HeroHeadline() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), EVERY);
    return () => clearInterval(id);
  }, [paused, reduced]);

  return (
    <>
      <h1 className={styles.h1}>
        Figuring out{" "}
        <span className={styles.word} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {/* key remounts the span so the rise keyframe replays per word */}
          <span key={i} className={reduced ? undefined : styles.wordIn}>{WORDS[i]}</span>
        </span>
      </h1>
      <div className={styles.tabs} role="tablist" aria-label="Topics">
        {WORDS.map((w, n) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={n === i}
            aria-label={w}
            className={classNames(styles.tab, n === i && styles.tabOn)}
            onClick={() => setI(n)}
          />
        ))}
      </div>
    </>
  );
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onClick = async () => {
    try {
      await navigator.clipboard?.writeText(email);
    } catch {}
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" className={styles.copy} onClick={onClick}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
