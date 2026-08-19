"use client";

import Link from "next/link";
import { courseStanding } from "@/lib/reader-selectors";
import { useReader } from "./ReaderProvider";

/** Progress meter and resume button at the top of a course overview. */
export function CourseProgressHeader({
  courseSlug,
  lessons,
}: {
  courseSlug: string;
  lessons: Array<{ slug: string }>;
}) {
  const { ready, lessons: state } = useReader();
  const standing = courseStanding(lessons, ready ? (state[courseSlug]?.done ?? []) : []);

  return (
    <>
      <div className="ds-row" style={{ marginBottom: 26 }}>
        {standing.next && (
          <Link href={`/learn/${courseSlug}/${standing.next.slug}`} className="ds-box ds-dark">
            {standing.started ? `Resume lesson ${standing.number}` : "Start lesson 1"}
          </Link>
        )}
        <span className="ds-meta ds-meta-s">{lessons.length} lessons · free</span>
      </div>
      <div className="ds-between ds-meta" style={{ marginBottom: 8 }}>
        <span>Your progress</span>
        <span>
          {standing.doneCount} of {lessons.length} lessons
        </span>
      </div>
      <div className="ds-bar" style={{ height: 6, marginBottom: 34 }}>
        <i style={{ width: `${standing.percent}%` }} />
      </div>
    </>
  );
}
