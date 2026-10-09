"use client";

import { useProgress } from "@/lib/user-data";
import s from "./article.module.scss";

export function LessonBar({ course, total }: { course: string; total: number }) {
  const { signedIn, done } = useProgress(course);
  if (!signedIn) return null;
  const pct = total ? Math.round((done.length / total) * 100) : 0;
  return (
    <>
      <span className={s.bar} aria-hidden="true"><span style={{ width: `${pct}%` }} /></span>
      <span className={s.pct}>{pct}%</span>
    </>
  );
}
