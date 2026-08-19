"use client";

import Link from "next/link";
import { courseStanding } from "@/lib/reader-selectors";
import { useReader } from "./ReaderProvider";

export type RailCourse = {
  slug: string;
  title: string;
  lessonCount: number;
  /** Ordered, so "resume" can pick the first unfinished lesson. */
  lessons: Array<{ slug: string; title: string }>;
};

/**
 * "Course in progress" once the reader has started one, otherwise an
 * invitation to start — the block never renders empty.
 */
export function CourseRail({ courses, compact = false }: { courses: RailCourse[]; compact?: boolean }) {
  const { ready, lessons } = useReader();
  if (courses.length === 0) return null;

  const started = ready
    ? courses
        .map((course) => ({ course, entry: lessons[course.slug] }))
        .filter((item) => item.entry)
        .sort((a, b) => (b.entry?.updatedAt ?? 0) - (a.entry?.updatedAt ?? 0))[0]
    : undefined;

  const course = started?.course ?? courses[0];
  const standing = courseStanding(course.lessons, started?.entry?.done ?? []);

  return (
    <div>
      <span className="ds-kickq" style={{ marginBottom: compact ? 12 : 16 }}>
        {standing.started ? "Course in progress" : "Start a course"}
      </span>
      <div className={compact ? "ds-tint ds-course-compact" : undefined}>
        <div className="ds-t-s" style={{ marginBottom: 10 }}>
          {course.title}
        </div>
        <span className="ds-meta ds-meta-s" style={{ display: "block", marginBottom: 12 }}>
          {standing.started
            ? `Lesson ${standing.number} of ${course.lessonCount} · free`
            : `${course.lessonCount} lessons · free`}
        </span>
        <div className="ds-bar" style={{ marginBottom: 14 }}>
          <i style={{ width: `${standing.percent}%` }} />
        </div>
        <Link
          href={standing.next ? `/learn/${course.slug}/${standing.next.slug}` : `/learn/${course.slug}`}
          className="ds-box ds-dark ds-block"
        >
          {standing.started ? `Resume lesson ${standing.number}` : "Start lesson 1"}
        </Link>
      </div>
    </div>
  );
}
