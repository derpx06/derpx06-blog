"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { useProgress, useSignIn } from "@/lib/user-data";
import { Icon } from "@/components/site/icons";
import { summarize, type CourseData } from "./LearnClient";
import s from "./learn.module.scss";

const LINE: Record<string, string> = { "finetuning-an-llm": "A", "langchain-mastery": "B", "python-overview": "C" };
const OUTCOMES: Record<string, string[]> = {
  "finetuning-an-llm": [
    "Decide when finetuning beats prompting or RAG, and what to tune.",
    "Design and clean an SFT dataset that doesn't poison the model.",
    "Run LoRA and DPO training and read the eval numbers honestly.",
    "Ship a tuned model behind a safe rollout and roll it back if needed.",
  ],
  "langchain-mastery": [
    "Compose chains with LCEL and the Runnable protocol.",
    "Build a RAG pipeline from loaders to re-ranking.",
    "Give agents tools, memory and a human in the loop.",
    "Trace, evaluate and harden the thing before it serves traffic.",
  ],
  "python-overview": [
    "Read idiomatic Python without translating it in your head.",
    "Pick the right data structure and know why.",
    "Use comprehensions, generators and functional tools fluently.",
    "Write classes and argument signatures that don't surprise people.",
  ],
};

type Props = { course: CourseData; others: { slug: string; title: string; total: number }[] };

export function CourseClient({ course, others }: Props) {
  const { signedIn, isDone, setDone, reset, requireSignIn } = useProgress(course.slug);
  const signIn = useSignIn();
  const done = course.parts.flatMap((p) => p.lessons).filter((l) => isDone(l.slug)).map((l) => l.slug);
  const sm = summarize(course, done);
  const nextPart = sm.next ? course.parts.findIndex((p) => p.lessons.some((l) => l.slug === sm.next!.slug)) : 0;

  const [open, setOpen] = useState<number[]>([nextPart]);
  const [q, setQ] = useState("");
  const [hideDone, setHideDone] = useState(false);
  const needle = q.trim().toLowerCase();
  const allOpen = open.length === course.parts.length;

  const cta = sm.doneCount === 0 ? { label: "Start from note 1 →", href: sm.first?.href } : sm.next ? { label: `Continue: ${sm.next.title} →`, href: sm.next.href } : { label: "Review from note 1 →", href: sm.first?.href };
  const target = sm.next ?? sm.first;
  const targetPart = target ? course.parts.find((p) => p.lessons.some((l) => l.slug === target.slug))?.title : null;

  const onReset = () => { if (window.confirm("Reset your progress on this course? This can't be undone.")) reset(); };
  const toggle = (slug: string) => (signedIn ? setDone(slug, !isDone(slug)) : requireSignIn());

  return (
    <div className="wrap">
      <header className={`darkCard ${s.head}`}>
        <div className="glow" />
        <div className={s.headBody}>
          <div className={s.chips}>
            <Link href="/learn" className={s.back}><Icon name="chevronLeft" size={14} />All notebooks</Link>
            <span className={s.line}>Line {LINE[course.slug] ?? "·"}</span>
          </div>
          <h1 className={s.hTitle}>{course.title}</h1>
          <p className={s.hDesc}>{course.description} Free, {course.total} notes in {course.parts.length} parts.</p>
          <div className={s.hCtas}>
            {cta.href && <Link href={cta.href} className="btnAccent">{cta.label}</Link>}
            {signedIn && sm.doneCount > 0 && <button type="button" className="btnGhost" onClick={onReset}>Reset progress</button>}
          </div>
        </div>
        <div className={s.ringWrap}>
          <div className={s.ring} style={{ "--p": `${sm.pct}%` } as CSSProperties} role="img" aria-label={`${sm.pct}% done`}>
            <div className={s.ringIn}><b>{sm.pct}%</b><span className="eyebrow">done</span></div>
          </div>
          <div className={s.ringSub}>{sm.doneCount} of {course.total} lessons · {sm.partsDone} of {course.parts.length} parts complete</div>
          {!signedIn && <button type="button" className={s.signIn} onClick={signIn}>Sign in to track progress</button>}
        </div>
      </header>

      <div className={s.grid}>
        <div className={s.main}>
          <div className={`card ${s.toolbar}`}>
            <label className={s.search}>
              <Icon name="search" size={14} />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a note…" aria-label="Find a note" />
            </label>
            <button type="button" className={`btnGhost btnSm ${s.toggle}`} aria-pressed={hideDone} onClick={() => setHideDone(!hideDone)}>Hide completed</button>
            <button type="button" className="btnGhost btnSm" onClick={() => setOpen(allOpen ? [] : course.parts.map((_, i) => i))}>{allOpen ? "Collapse all" : "Expand all"}</button>
          </div>

          {course.parts.map((p, pi) => {
            const lessons = p.lessons.filter((l) => (!needle || l.title.toLowerCase().includes(needle)) && (!hideDone || !isDone(l.slug)));
            if (needle && lessons.length === 0) return null;
            const d = p.lessons.filter((l) => isDone(l.slug)).length;
            const isOpen = needle ? true : open.includes(pi);
            const full = d === p.lessons.length && d > 0;
            return (
              <section key={p.title} className={`card ${s.part}`}>
                <button type="button" className={s.partBtn} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? open.filter((x) => x !== pi) : [...open, pi])}>
                  <span className={`${s.num} ${full ? s.full : d > 0 ? s.some : ""}`}>{full ? <Icon name="check" size={16} strokeWidth={3} /> : String(pi + 1).padStart(2, "0")}</span>
                  <span className={s.partName}><b>{p.title}</b><span className={s.partBar}><span style={{ width: `${p.lessons.length ? (d / p.lessons.length) * 100 : 0}%` }} /></span></span>
                  <span className={s.count}>{d} / {p.lessons.length}</span>
                  <Icon name="chevronDown" size={16} className={`${s.chev} ${isOpen ? s.open : ""}`} />
                </button>
                {isOpen && (
                  <div className={s.lessons}>
                    {lessons.length === 0 && <div className={s.empty}>Everything here is done.</div>}
                    {lessons.map((l) => {
                      const on = isDone(l.slug);
                      return (
                        <div key={l.slug} className={s.lesson}>
                          <button type="button" className={`${s.check} ${on ? s.on : ""}`} aria-pressed={on} aria-label={on ? `Mark "${l.title}" not done` : `Mark "${l.title}" done`} onClick={() => toggle(l.slug)}>
                            {on && <Icon name="check" size={14} strokeWidth={3} />}
                          </button>
                          <span className={s.lessonTitle}>
                            <Link href={l.href}>{l.title}</Link>
                            {sm.next?.slug === l.slug && <span className="tag">Up next</span>}
                          </span>
                          <Link href={l.href} className={`btnGhost btnSm ${s.read}`}>Read →</Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <aside className={s.aside}>
          {target && (
            <div className={s.next}>
              <span className="eyebrow">{sm.doneCount === 0 ? "Start here" : sm.next ? "Up next" : "Read again"}</span>
              <b>{target.title}</b>
              {targetPart && <small>{targetPart}</small>}
              <Link href={target.href} className="btn">Read the note →</Link>
            </div>
          )}
          {OUTCOMES[course.slug] && (
            <div className={`card ${s.asideCard}`}>
              <span className="eyebrow">You&apos;ll be able to</span>
              <ul className={s.outcomes}>{OUTCOMES[course.slug].map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
          )}
          {others.length > 0 && (
            <div className={`darkCard ${s.others}`}>
              <span className="eyebrow">Other lines</span>
              {others.map((o) => <Link key={o.slug} href={`/learn/${o.slug}`} className={s.other}>{o.title}<span>{o.total} notes</span></Link>)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
