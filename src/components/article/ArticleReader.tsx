"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { TocItem } from "@/lib/article";
import { useProgress, useSaved, type SavedKind } from "@/lib/user-data";
import { Icon } from "@/components/site/icons";
import s from "./article.module.scss";

export type LessonOutline = {
  course: { slug: string; title: string };
  parts: { title: string; lessons: { slug: string; title: string; href: string }[] }[];
  partIndex: number;
  slug: string;
};

type Props = {
  toc: TocItem[];
  minutes: number;
  save: { kind: SavedKind; slug: string; title: string; href: string; meta?: string };
  lesson?: LessonOutline;
  children: ReactNode;
};

const SIZE_KEY = "derpx06.textsize";

/** Client shell for the reading column: progress bar, aside (TOC, outline, tools) and the sized body. */
export function ArticleReader({ toc, minutes, save, lesson, children }: Props) {
  const [size, setSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const v = Number(localStorage.getItem(SIZE_KEY)); if (v >= 0 && v <= 2) setSize(v); } catch {}
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(h > 0 ? Math.min(100, Math.round((window.scrollY / h) * 100)) : 100);
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
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [toc]);

  const pickSize = (i: number) => { setSize(i); try { localStorage.setItem(SIZE_KEY, String(i)); } catch {} };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const minsLeft = progress >= 98 ? "Finished — thanks for reading." : `${Math.max(1, Math.ceil(minutes * (1 - progress / 100)))} min left`;

  const tocList = toc.length > 0 && (
    <div>
      <div className={s.asideH}>On this page</div>
      <nav className={s.toc} aria-label="On this page">
        {toc.map((t) => (
          <a key={t.id} href={`#${t.id}`} className={`${t.level === 3 ? s.l3 : ""} ${active === t.id ? s.on : ""}`} aria-current={active === t.id ? "location" : undefined}>{t.text}</a>
        ))}
      </nav>
    </div>
  );

  const tools = (
    <>
      <div className={s.seg} role="group" aria-label="Text size">
        {["Small", "Medium", "Large"].map((label, i) => (
          <button key={label} type="button" aria-pressed={size === i} aria-label={`${label} text`} onClick={() => pickSize(i)}>A</button>
        ))}
      </div>
      <SaveButton item={save} />
      <button type="button" className={s.tool} onClick={copyLink}><Icon name={copied ? "check" : "link"} size={14} />{copied ? "Link copied" : "Copy link"}</button>
    </>
  );

  return (
    <>
      <div className={s.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>
      <div className={s.grid}>
        <aside className={`${s.aside} ${s.asideL}`} aria-label="Course outline">
          {lesson && <Outline lesson={lesson} />}
        </aside>

        <div className={s.content}>
          {(toc.length > 0 || lesson) && (
            <details className={s.mobileToc}>
              <summary>{lesson ? "Course outline & contents" : "On this page"}<Icon name="chevronDown" size={16} /></summary>
              {lesson && <div style={{ margin: "12px 0" }}><Outline lesson={lesson} /></div>}
              {tocList}
              <div className={s.mobileTools}>{tools}</div>
            </details>
          )}
          <div ref={bodyRef} className={s.body} data-size={size}>{children}</div>
        </div>

        <aside className={`${s.aside} ${s.asideR}`} aria-label="On this page">
          {tocList}
          <div className={s.tools}>
            {tools}
            <span className={s.left} aria-live="polite">{minsLeft}</span>
          </div>
        </aside>
      </div>
    </>
  );
}

function Outline({ lesson }: { lesson: LessonOutline }) {
  const [open, setOpen] = useState<number[]>([lesson.partIndex]);
  const { isDone } = useProgress(lesson.course.slug);
  return (
    <div>
      <div className={s.asideH}>{lesson.course.title}</div>
      <div className={s.outline}>
        {lesson.parts.map((p, pi) => {
          const isOpen = open.includes(pi);
          const done = p.lessons.filter((l) => isDone(l.slug)).length;
          return (
            <div key={p.title} className={s.part}>
              <button type="button" className={`${s.partBtn} ${pi === lesson.partIndex ? s.cur : ""}`} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? open.filter((x) => x !== pi) : [...open, pi])}>
                <small>{String(pi + 1).padStart(2, "0")}</small><span>{p.title}</span><em>{done}/{p.lessons.length}</em>
              </button>
              {isOpen && (
                <div className={s.lessons}>
                  {p.lessons.map((l) => (
                    <Link key={l.slug} href={l.href} className={`${s.lesson} ${l.slug === lesson.slug ? s.cur : ""}`} aria-current={l.slug === lesson.slug ? "page" : undefined}>
                      <span className={`${s.tick} ${isDone(l.slug) ? s.done : ""}`}>{isDone(l.slug) && <Icon name="check" size={10} strokeWidth={3} />}</span>
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

export function SaveButton({ item, compact }: { item: Props["save"]; compact?: boolean }) {
  const { has, toggle, signedIn } = useSaved();
  const on = signedIn && has(item.kind, item.slug);
  const label = on ? "Saved" : signedIn ? "Save for later" : "Sign in to save";
  return (
    <button type="button" className={`${s.tool} ${on ? s.on : ""}`} onClick={() => toggle(item)} aria-pressed={on} aria-label={compact ? label : undefined} title={label}>
      <Icon name="bookmark" size={14} fill={on ? "currentColor" : "none"} />{!compact && label}
    </button>
  );
}
