"use client";

import Link from "next/link";
import { useState } from "react";
import { courseStanding } from "@/lib/reader-selectors";
import { useReader } from "./ReaderProvider";

export type SyllabusPart = { title: string; lessons: Array<{ slug: string; title: string }> };

const COLLAPSE_AFTER = 6;

/** Screen 05's numbered syllabus, grouped by part, with per-reader done marks. */
export function CourseSyllabus({
  courseSlug,
  parts,
}: {
  courseSlug: string;
  parts: SyllabusPart[];
}) {
  const { ready, lessons: state } = useReader();
  const [expanded, setExpanded] = useState(false);

  const done = ready ? (state[courseSlug]?.done ?? []) : [];
  const flat = parts.flatMap((part) => part.lessons);
  const standing = courseStanding(flat, done);
  const hidden = Math.max(0, flat.length - COLLAPSE_AFTER);

  let counter = 0;

  return (
    <>
      {parts.map((part) => {
        const rows = part.lessons.map((lesson) => {
          counter += 1;
          return { lesson, number: counter };
        });
        const visible = expanded ? rows : rows.filter((row) => row.number <= COLLAPSE_AFTER);
        if (visible.length === 0) return null;

        return (
          <section key={part.title} style={{ marginBottom: 18 }}>
            {parts.length > 1 && (
              <span className="ds-kickq" style={{ margin: "18px 0 6px" }}>
                {part.title}
              </span>
            )}
            <div className="ds-stack">
              {visible.map(({ lesson, number }) => {
                const isDone = done.includes(lesson.slug);
                const isNext = standing.started && standing.next?.slug === lesson.slug;
                return (
                  <div
                    key={lesson.slug}
                    className="ds-item"
                    style={{
                      alignItems: "baseline",
                      gap: 16,
                      background: isNext ? "var(--tint)" : undefined,
                      padding: isNext ? "16px 14px" : undefined,
                    }}
                  >
                    <span className="ds-num" style={{ width: 24 }}>
                      {String(number).padStart(2, "0")}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/learn/${courseSlug}/${lesson.slug}`}
                        className="ds-t-s ds-plain-link"
                      >
                        {lesson.title}
                      </Link>
                    </div>
                    {isNext ? (
                      <Link
                        href={`/learn/${courseSlug}/${lesson.slug}`}
                        className="ds-box ds-dark"
                        style={{ alignSelf: "center" }}
                      >
                        Resume
                      </Link>
                    ) : (
                      <span className="ds-meta ds-meta-s">{isDone ? "done" : ""}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {hidden > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <button type="button" className="ds-box" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Show fewer lessons" : `Show ${hidden} more lessons`}
          </button>
        </div>
      )}
    </>
  );
}
