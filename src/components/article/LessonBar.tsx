"use client";

import { useReader } from "@/components/site/ReaderProvider";
import { courseStanding } from "@/lib/reader-selectors";
import s from "./article.module.scss";

export function LessonBar({ course, slugs }: { course: string; slugs: string[] }) {
  const { ready, signedIn, lessons } = useReader();
  if (!ready || !signedIn) return null;
  const { percent } = courseStanding(
    slugs.map((slug) => ({ slug })),
    lessons[course]?.done ?? [],
  );
  return (
    <>
      <span className={s.bar} aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
      <span className={s.pct}>{percent}%</span>
    </>
  );
}
