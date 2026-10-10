"use client";

import { useState } from "react";
import { Icon } from "./icons";
import s from "./SiteFooter.module.scss";

export function FooterLetter({ action }: { action: string }) {
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <div className={s.form} style={{ borderColor: "color-mix(in oklch, var(--acc) 50%, transparent)", color: "inherit", font: "600 14px/1 var(--font-archivo)" }}>
        <Icon name="check" size={14} /> You&apos;re in — see you next week.
      </div>
    );
  }
  if (!action) return <p className={s.note}>Coming soon. Until then, the writing is all on this site.</p>;
  return (
    <form className={s.form} action={action} method="post" target="_blank" onSubmit={() => setTimeout(() => setDone(true), 300)}>
      <Icon name="mail" size={17} />
      <input type="email" name="EMAIL" required aria-label="Email address" placeholder="you@company.com" autoComplete="email" />
      <button type="submit" className={s.submit}>Subscribe <em>→</em></button>
    </form>
  );
}

/** Live-letter wordmark: cursor-lit gradient, per-letter lift, click to top. */
export function Wordmark() {
  return (
    <div className={s.wmWrap}>
      <button
        type="button"
        className={s.wm}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--wx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--wy", `${e.clientY - r.top}px`); }}
        onMouseLeave={(e) => { e.currentTarget.style.setProperty("--wx", "-999px"); e.currentTarget.style.setProperty("--wy", "-999px"); }}
      >
        {"derpx06.dev".split("").map((ch, i) => (
          <span key={i} className={s.wmLetter} style={{ transitionDelay: `${i * 12}ms` }}>{ch}</span>
        ))}
      </button>
    </div>
  );
}
