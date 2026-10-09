"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/user-data";
import { Icon } from "@/components/site/icons";
import s from "./learn.module.scss";

export type CourseData = {
  slug: string;
  title: string;
  description: string;
  parts: { title: string; lessons: { slug: string; title: string; href: string }[] }[];
  total: number;
};

const GOALS: { label: string; slug: string; hint: string }[] = [
  { label: "RAG & agents", slug: "langchain-mastery", hint: "Start with LangChain Mastery: retrieval, memory and agents, end to end." },
  { label: "Custom models", slug: "finetuning-an-llm", hint: "Start with Finetuning an LLM: data, LoRA, DPO and a safe rollout." },
  { label: "Python basics", slug: "python-overview", hint: "Start with the Python Overview, then come back for the LLM lines." },
  { label: "Not sure", slug: "langchain-mastery", hint: "LangChain Mastery is the longest line and covers the most ground." },
];
const LINE = ["A", "B", "C", "D", "E"];

/** Progress summary for one course, from the lesson slugs marked done. */
export function summarize(course: CourseData, done: string[]) {
  const flat = course.parts.flatMap((p) => p.lessons);
  const doneCount = flat.filter((l) => done.includes(l.slug)).length;
  const next = flat.find((l) => !done.includes(l.slug)) ?? null;
  const partsDone = course.parts.filter((p) => p.lessons.length > 0 && p.lessons.every((l) => done.includes(l.slug))).length;
  return { flat, doneCount, next, partsDone, pct: flat.length ? Math.round((doneCount / flat.length) * 100) : 0, first: flat[0] ?? null };
}

export function LearnClient({ courses }: { courses: CourseData[] }) {
  const [goal, setGoal] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const search = useRef<HTMLInputElement>(null);

  // ponytail: hook in a loop — `courses` is static config, so the call count never changes between renders.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const progress = courses.map((c) => useProgress(c.slug));
  const summaries = courses.map((c, i) => summarize(c, progress[i].done));
  const totalNotes = courses.reduce((n, c) => n + c.total, 0);
  const recommended = goal === null ? null : GOALS[goal].slug;

  const resumeIdx = summaries.reduce<number>((best, sm, i) => (sm.doneCount > 0 && sm.next && (best < 0 || sm.pct > summaries[best].pct) ? i : best), -1);
  const resume = resumeIdx >= 0 ? { course: courses[resumeIdx], next: summaries[resumeIdx].next! } : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      search.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const needle = q.trim().toLowerCase();
  const hits = needle
    ? courses.flatMap((c) => c.parts.flatMap((p, pi) => p.lessons.filter((l) => l.title.toLowerCase().includes(needle)).map((l) => ({ ...l, course: c.title, part: pi + 1 }))))
    : [];

  return (
    <>
      <section className={`hero ${s.hero}`}>
        <div className={`wrap ${s.heroInner}`}>
          <span className={s.status}><i className={s.dot} />Notes · {courses.length} notebooks · {totalNotes} notes</span>
          <h1 className={s.h1}>Pick a line, and ride it<span>all the way to production</span></h1>
          <p className={`lede ${s.lede}`}>What I&apos;m learning, jotted down in order. Sign in and your progress follows you.</p>
          <div className={s.goals} role="group" aria-label="What are you here for?">
            <span className="eyebrow">I want to build</span>
            {GOALS.map((g, i) => (
              <button key={g.label} type="button" className={s.goalBtn} aria-pressed={goal === i} onClick={() => setGoal(goal === i ? null : i)}>{g.label}</button>
            ))}
          </div>
          {goal !== null && <p className={s.hint}>{GOALS[goal].hint}</p>}
        </div>
        <div className="heroFade" />
      </section>

      <section className={`wrap ${s.body}`}>
        {resume && (
          <div className={`darkCard ${s.resume}`}>
            <div className="glow" />
            <div className={s.resumeText}>
              <span className="eyebrow">Pick up where you left off · {resume.course.title}</span>
              <b>Next: {resume.next.title}</b>
            </div>
            <Link href={resume.next.href} className="btnAccent">Continue →</Link>
          </div>
        )}

        <div className={s.courses}>
          {courses.map((c, i) => {
            const sm = summaries[i];
            const variant = i % 3 === 0 ? "dark" : i % 3 === 1 ? "accent" : "plain";
            const cta = sm.doneCount === 0 ? { label: "Start from note 1 →", href: sm.first?.href } : sm.next ? { label: "Continue →", href: sm.next.href } : { label: "Review →", href: sm.first?.href };
            const ctaClass = variant === "dark" ? "btnAccent" : variant === "accent" ? s.btnWhite : "btnPrimary";
            return (
              <article key={c.slug} className={`${variant === "dark" ? "darkCard" : "card"} ${s.course} ${s[variant]}`}>
                {variant === "dark" && <div className="glow" />}
                <div className={s.courseMain}>
                  <div className={s.courseHead}>
                    <span className={s.line}>Line {LINE[i] ?? i + 1}</span>
                    <span className={s.meta}>{c.total} notes · {c.parts.length} parts</span>
                    {recommended === c.slug && <span className={s.rec}>Recommended for you</span>}
                  </div>
                  <h2 className={s.courseTitle}>{c.title}</h2>
                  <p className={s.courseDesc}>{c.description}</p>
                  <div className={s.courseCtas}>
                    {cta.href && <Link href={cta.href} className={ctaClass}>{cta.label}</Link>}
                    <Link href={`/learn/${c.slug}`} className="btnGhost">Outline</Link>
                    <span className={s.pct}>{sm.doneCount > 0 ? `${sm.pct}% complete` : "Not started"}</span>
                  </div>
                </div>
                <div className={s.rail} aria-label="Parts">
                  {c.parts.map((p, pi) => {
                    const full = p.lessons.length > 0 && p.lessons.every((l) => progress[i].isDone(l.slug));
                    return (
                      <div key={p.title} className={s.railPart}>
                        <div className={s.station}><i className={full ? s.full : ""} />{pi < c.parts.length - 1 && <b />}</div>
                        <div className={s.railBody}>
                          <span className={s.railTitle}>{p.title}</span>
                          <span className={s.squares}>{p.lessons.map((l) => <i key={l.slug} className={progress[i].isDone(l.slug) ? s.on : ""} />)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>

        <div className={s.every}>
          <div className={s.everyHead}>
            <div>
              <span className="eyebrow">Every note</span>
              <h2 className="h2">Jump straight to a topic</h2>
            </div>
            <label className={s.search}>
              <Icon name="search" size={15} />
              <input ref={search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all notes…" aria-label="Search all notes" />
              <kbd className="mono">/</kbd>
            </label>
          </div>

          {needle ? (
            hits.length ? (
              <div className={s.hits}>
                {hits.map((h) => (
                  <Link key={h.href} href={h.href} className={`card ${s.hit}`}>
                    <small className="mono">{h.course} · Part {h.part}</small>
                    <b>{h.title}</b>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={s.none}>No note matches &ldquo;{q.trim()}&rdquo;.</p>
            )
          ) : (
            <div className={s.tiles}>
              {[
                ["01", "Every note is an article", "Each lesson is a full write-up, not a slide. Read it like a post."],
                ["02", "Progress saves to your account", "Tick a note done and it stays ticked on every device you sign in from."],
                ["03", "Jump in anywhere", "The lines are ordered, but nothing is locked. Search, open, read."],
              ].map(([n, t, d]) => (
                <div key={n} className={`card ${s.tile}`}>
                  <span className="mono">{n}</span>
                  <b>{t}</b>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
