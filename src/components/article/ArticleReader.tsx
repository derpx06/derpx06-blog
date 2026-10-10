"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import { Icon } from "@/components/site/icons";
import { useReader } from "@/components/site/ReaderProvider";
import { SaveButton } from "@/components/site/SaveButton";
import {
  type ReaderTarget,
  ScrollProgress,
  useScrollPercent,
} from "@/components/site/ScrollProgress";
import type { Heading } from "@/lib/headings";
import s from "./article.module.scss";

export type LessonOutline = {
  course: { slug: string; title: string };
  parts: { title: string; lessons: { slug: string; title: string; href: string }[] }[];
  partIndex: number;
  slug: string;
};

type Props = {
  toc: Heading[];
  piece: ReaderTarget;
  lesson?: LessonOutline;
  /** Rendered in the right aside under the contents. */
  extra?: ReactNode;
  children: ReactNode;
};

// Per-device preference, so localStorage is the right home for it.
const SIZE_KEY = "derpx06.textsize";

/** Client shell for the reading column: progress bar, asides (TOC, outline, tools) and the sized body. */
export function ArticleReader({ toc, piece, lesson, extra, children }: Props) {
  const [size, setSize] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const percent = useScrollPercent();

  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(SIZE_KEY));
      if (v >= 0 && v <= 2) setSize(v);
    } catch {}
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let cur: string | null = null;
        for (const t of toc) {
          const el = document.getElementById(t.id);
          if (el && el.getBoundingClientRect().top < 140) cur = t.id;
        }
        setActive(cur);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [toc]);

  const pickSize = (i: number) => {
    setSize(i);
    try {
      localStorage.setItem(SIZE_KEY, String(i));
    } catch {}
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const minsLeft =
    percent >= 98
      ? "Finished — thanks for reading."
      : `${Math.max(1, Math.ceil(piece.minutes * (1 - percent / 100)))} min left`;

  const tocList = toc.length > 0 && (
    <div>
      <div className={s.asideH}>On this page</div>
      <nav className={s.toc} aria-label="On this page">
        {toc.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={`${t.level === 3 ? s.l3 : ""} ${active === t.id ? s.on : ""}`}
            aria-current={active === t.id ? "location" : undefined}
          >
            {t.text}
          </a>
        ))}
      </nav>
    </div>
  );

  const tools = (
    <>
      <fieldset className={s.seg} aria-label="Text size">
        {["Small", "Medium", "Large"].map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={size === i}
            aria-label={`${label} text`}
            onClick={() => pickSize(i)}
          >
            A
          </button>
        ))}
      </fieldset>
      <SaveButton piece={piece} />
      <button type="button" className={s.tool} onClick={copyLink}>
        <Icon name={copied ? "check" : "link"} size={14} />
        {copied ? "Link copied" : "Copy link"}
      </button>
    </>
  );

  return (
    <>
      <ScrollProgress piece={piece} />
      <div className={s.grid}>
        <aside className={`${s.aside} ${s.asideL}`} aria-label="Course outline">
          {lesson && <Outline lesson={lesson} />}
        </aside>

        <div className={s.content}>
          {(toc.length > 0 || lesson) && (
            <details className={s.mobileToc}>
              <summary>
                {lesson ? "Course outline & contents" : "On this page"}
                <Icon name="chevronDown" size={16} />
              </summary>
              {lesson && (
                <div style={{ margin: "12px 0" }}>
                  <Outline lesson={lesson} />
                </div>
              )}
              {tocList}
              <div className={s.mobileTools}>{tools}</div>
            </details>
          )}
          <div className={`ds-prose ds-prose-dropcap ${s.body}`} data-size={size}>
            {children}
          </div>
        </div>

        <aside className={`${s.aside} ${s.asideR}`} aria-label="On this page">
          {tocList}
          <div className={s.tools}>
            {tools}
            <span className={s.left} aria-live="polite">
              {minsLeft}
            </span>
          </div>
          {extra}
        </aside>
      </div>
    </>
  );
}

function Outline({ lesson }: { lesson: LessonOutline }) {
  const [open, setOpen] = useState<number[]>([lesson.partIndex]);
  const { lessons } = useReader();
  const done = lessons[lesson.course.slug]?.done ?? [];
  const isDone = (slug: string) => done.includes(slug);
  return (
    <div>
      <div className={s.asideH}>{lesson.course.title}</div>
      <div className={s.outline}>
        {lesson.parts.map((p, pi) => {
          const isOpen = open.includes(pi);
          const count = p.lessons.filter((l) => isDone(l.slug)).length;
          return (
            <div key={p.title} className={s.part}>
              <button
                type="button"
                className={`${s.partBtn} ${pi === lesson.partIndex ? s.cur : ""}`}
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? open.filter((x) => x !== pi) : [...open, pi])}
              >
                <small>{String(pi + 1).padStart(2, "0")}</small>
                <span>{p.title}</span>
                <em>
                  {count}/{p.lessons.length}
                </em>
              </button>
              {isOpen && (
                <div className={s.lessons}>
                  {p.lessons.map((l) => (
                    <Link
                      key={l.slug}
                      href={l.href}
                      className={`${s.lesson} ${l.slug === lesson.slug ? s.cur : ""}`}
                      aria-current={l.slug === lesson.slug ? "page" : undefined}
                    >
                      <span className={`${s.tick} ${isDone(l.slug) ? s.done : ""}`}>
                        {isDone(l.slug) && <Icon name="check" size={10} strokeWidth={3} />}
                      </span>
                      <span>{l.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
