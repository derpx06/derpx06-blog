"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/site/icons";
import { useReader } from "@/components/site/ReaderProvider";
import s from "./article.module.scss";

export function ShareRow({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className={s.share}>
      <span>Share</span>
      <a
        className={s.shareBtn}
        href={`https://x.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener"
      >
        X
      </a>
      <a
        className={s.shareBtn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank"
        rel="noopener"
      >
        LinkedIn
      </a>
      <a className={s.shareBtn} href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}>
        <Icon name="mail" size={14} />
        Email
      </a>
      <button type="button" className={s.shareBtn} onClick={copy}>
        <Icon name={copied ? "check" : "copy"} size={14} />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

type Nav = { href: string; title: string } | null;

export function LessonEnd({
  course,
  slug,
  href,
  prev,
  next,
}: {
  course: string;
  slug: string;
  href: string;
  prev: Nav;
  next: Nav;
}) {
  const { signedIn, lessons, completeLesson } = useReader();
  const done = signedIn && (lessons[course]?.done ?? []).includes(slug);
  const complete = () => completeLesson(course, slug);
  return (
    <div className={s.end}>
      <div className={`${s.complete} ${done ? s.done : ""}`}>
        <div className={s.completeText}>
          <span>
            {done ? "Lesson done" : signedIn ? "Finished reading?" : "Track your progress"}
          </span>
          <b>
            {done
              ? next
                ? "Nice — on to the next one."
                : "That's the whole course."
              : signedIn
                ? "Mark this lesson complete to track your progress."
                : "Sign in and your progress follows you across devices."}
          </b>
        </div>
        <div className={s.completeBtns}>
          {signedIn ? (
            <button
              type="button"
              className="btn"
              style={
                done
                  ? { background: "rgba(255,255,255,.18)", color: "#fff" }
                  : { background: "var(--acc)", color: "#fff" }
              }
              onClick={complete}
              disabled={done}
              aria-pressed={done}
            >
              {done ? (
                <>
                  <Icon name="check" size={14} strokeWidth={3} /> Completed
                </>
              ) : (
                "Mark complete"
              )}
            </button>
          ) : (
            <Link
              href={`/signin?next=${encodeURIComponent(href)}`}
              className="btn"
              style={{ background: "var(--acc)", color: "#fff" }}
            >
              Sign in to track progress <Icon name="arrowRight" size={13} strokeWidth={2.5} />
            </Link>
          )}
          {next && (
            <Link
              href={next.href}
              className="btn"
              style={{ background: "#fff", color: "#201e1d" }}
              onClick={() => {
                if (signedIn && !done) complete();
              }}
            >
              {signedIn && !done ? "Complete & continue" : "Next lesson"}{" "}
              <Icon name="arrowRight" size={13} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      </div>
      <div className={s.pn}>
        {prev && (
          <Link href={prev.href} className={s.pnCard}>
            <small>← Previous lesson</small>
            <b>{prev.title}</b>
          </Link>
        )}
        {next && (
          <Link href={next.href} className={`${s.pnCard} ${s.next}`}>
            <small>Next lesson →</small>
            <b>{next.title}</b>
          </Link>
        )}
      </div>
    </div>
  );
}
