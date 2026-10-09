"use client";

import Link from "next/link";
import { useState } from "react";
import { courses } from "@/resources/courses";
import { person } from "@/resources";
import { Icon } from "./icons";
import s from "./SiteFooter.module.scss";

const BUTTONDOWN = process.env.NEXT_PUBLIC_BUTTONDOWN_USER;

export function SiteFooter() {
  const [done, setDone] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.letter}>
          <div>
            <span className={s.kicker}>The weekly letter</span>
            <h2 className={s.letterH}>One piece a week on systems, models and learning.</h2>
            <p className={s.letterP}>No tracking, no sponsors. Unsubscribe in one click.</p>
          </div>
          <div>
            {done ? (
              <div className={s.form} style={{ borderColor: "color-mix(in oklch, var(--acc) 50%, transparent)", color: "var(--dark-ink)", font: "600 14px/1 var(--font-archivo)" }}>
                <Icon name="check" size={14} /> You&apos;re in — see you next week.
              </div>
            ) : BUTTONDOWN ? (
              <form
                className={s.form}
                action={BUTTONDOWN ? `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN}` : undefined}
                method="post"
                target="_blank"
                onSubmit={() => setTimeout(() => setDone(true), 300)}
              >
                <Icon name="mail" size={17} />
                <input type="email" name="email" required aria-label="Email address" placeholder="you@company.com" disabled={!BUTTONDOWN} autoComplete="email" />
                <button type="submit" className={s.submit} disabled={!BUTTONDOWN}>Subscribe <em>→</em></button>
              </form>
            ) : (
              <p className={s.note}>Coming soon. Until then, the writing is all on this site.</p>
            )}
          </div>
        </div>

        <div className={s.cols}>
          <div className={s.about}>
            <Link href="/" className={s.brand}><i /><span>derpx06<em>.</em>dev</span></Link>
            <span className={s.blurb}>Essays, paper explainers and learning notes on systems and AI. Written by {person.firstName} {person.lastName} in Pune.</span>
            <div className={s.social}>
              <a href="https://github.com/derpx06" target="_blank" rel="noopener" aria-label="GitHub"><Icon name="github" /></a>
              <a href={`mailto:${person.email}`} aria-label="Email"><Icon name="mail" /></a>
            </div>
          </div>
          <div className={s.col}>
            <span className={s.colH}>Read</span>
            <Link href="/blog">Writing</Link>
            <Link href="/explainers">Explainers</Link>
            <Link href="/saved">Saved</Link>
          </div>
          <div className={s.col}>
            <span className={s.colH}>Notes</span>
            {courses.map((c) => <Link key={c.slug} href={`/learn/${c.slug}`}>{c.title}</Link>)}
          </div>
          <div className={s.col}>
            <span className={s.colH}>Me</span>
            <Link href="/about">About</Link>
            <a href="https://github.com/derpx06" target="_blank" rel="noopener">GitHub</a>
            <a href="/api/rss">RSS</a>
          </div>
        </div>

        <svg aria-hidden="true" viewBox="0 0 1124 142" className={s.wm}>
          <defs>
            <linearGradient id="ftWm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".13" />
              <stop offset="1" stopColor="#fff" stopOpacity=".02" />
            </linearGradient>
          </defs>
          <text x="0" y="140" textLength="1124" lengthAdjust="spacingAndGlyphs" fill="url(#ftWm)">derpx06.dev</text>
        </svg>
      </div>
      <div className={s.bar}>
        <div className="wrap" style={{ padding: 0 }}>
          <div className={s.barIn}>
            <span>© {year} {person.firstName} {person.lastName}</span>
            <button type="button" className={s.top} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <Icon name="arrowUp" size={13} strokeWidth={2.2} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
