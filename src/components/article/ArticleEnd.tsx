"use client";

import Link from "next/link";
import { useState } from "react";
import { useProgress } from "@/lib/user-data";
import { Icon } from "@/components/site/icons";
import s from "./article.module.scss";

export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => { try { await navigator.clipboard.writeText(url); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  return (
    <div className={s.share}>
      <span>Share</span>
      <a className={s.shareBtn} href={`https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`} target="_blank" rel="noopener">X</a>
      <a className={s.shareBtn} href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener">LinkedIn</a>
      <a className={s.shareBtn} href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}><Icon name="mail" size={14} />Email</a>
      <button type="button" className={s.shareBtn} onClick={copy}><Icon name={copied ? "check" : "copy"} size={14} />{copied ? "Copied" : "Copy link"}</button>
    </div>
  );
}

type Nav = { href: string; title: string } | null;

export function LessonEnd({ course, slug, prev, next }: { course: string; slug: string; prev: Nav; next: Nav }) {
  const { signedIn, isDone, setDone, requireSignIn } = useProgress(course);
  const done = signedIn && isDone(slug);
  return (
    <div className={s.end}>
      <div className={`${s.complete} ${done ? s.done : ""}`}>
        <div className={s.completeText}>
          <span>{done ? "Note done" : signedIn ? "Finished reading?" : "Track your progress"}</span>
          <b>{done ? (next ? "Nice — on to the next one." : "That's the whole line.") : signedIn ? "Mark this note done to track your progress." : "Sign in and your progress follows you across devices."}</b>
        </div>
        <div className={s.completeBtns}>
          {signedIn ? (
            <button type="button" className="btn" style={done ? { background: "rgba(255,255,255,.18)", color: "#fff" } : { background: "var(--acc)", color: "#fff" }} onClick={() => setDone(slug, !done)} aria-pressed={done}>
              {done ? <><Icon name="check" size={14} strokeWidth={3} /> Completed</> : "Mark complete"}
            </button>
          ) : (
            <button type="button" className="btn" style={{ background: "var(--acc)", color: "#fff" }} onClick={requireSignIn}>Sign in <Icon name="arrowRight" size={13} strokeWidth={2.5} /></button>
          )}
          {next && (
            <Link href={next.href} className="btn" style={{ background: "#fff", color: "#201e1d" }} onClick={() => { if (signedIn && !done) setDone(slug, true); }}>
              {signedIn && !done ? "Complete & continue" : "Next note"} <Icon name="arrowRight" size={13} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
      <div className={s.pn}>
        {prev && <Link href={prev.href} className={s.pnCard}><small>← Previous note</small><b>{prev.title}</b></Link>}
        {next && <Link href={next.href} className={`${s.pnCard} ${s.next}`}><small>Next note →</small><b>{next.title}</b></Link>}
      </div>
    </div>
  );
}
