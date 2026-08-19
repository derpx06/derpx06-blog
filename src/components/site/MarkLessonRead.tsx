"use client";

import { useEffect } from "react";
import { useReader } from "./ReaderProvider";

/** Records a lesson as done once its page has been open long enough to read. */
export function MarkLessonRead({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const { ready, signedIn, completeLesson } = useReader();

  useEffect(() => {
    if (!ready || !signedIn) return;
    const timer = setTimeout(() => completeLesson(courseSlug, lessonSlug), 20_000);
    return () => clearTimeout(timer);
  }, [ready, signedIn, courseSlug, lessonSlug, completeLesson]);

  return null;
}
