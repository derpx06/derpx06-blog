/**
 * Pure reads over reader state. Kept free of database and request imports so
 * both the server and the browser bundle can use exactly the same rules.
 */

export type ProgressEntry = {
  slug: string;
  href: string;
  title: string;
  minutes: number;
  percent: number;
  updatedAt: number;
};

export type SavedEntry = {
  slug: string;
  href: string;
  title: string;
  minutes: number;
  savedAt: number;
};

export type CourseEntry = { done: string[]; last: string; updatedAt: number };

export type ReaderState = {
  progress: Record<string, ProgressEntry>;
  saved: SavedEntry[];
  lessons: Record<string, CourseEntry>;
};

export const EMPTY_STATE: ReaderState = { progress: {}, saved: [], lessons: {} };

/** Below 3% nothing was really read; at 95% it is finished, not resumable. */
export function resumePoint(state: ReaderState): ProgressEntry | null {
  const entries = Object.values(state.progress).filter(
    (entry) => entry.percent >= 3 && entry.percent < 95,
  );
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

export function savedList(state: ReaderState): SavedEntry[] {
  return [...state.saved].sort((a, b) => b.savedAt - a.savedAt);
}

/** Course the reader touched most recently, if any. */
export function activeCourse(state: ReaderState): { slug: string; entry: CourseEntry } | null {
  const entries = Object.entries(state.lessons);
  if (entries.length === 0) return null;
  const [slug, entry] = entries.sort((a, b) => b[1].updatedAt - a[1].updatedAt)[0];
  return { slug, entry };
}

/** Where a reader stands in an ordered lesson list. */
export function courseStanding<T extends { slug: string }>(lessons: T[], done: string[]) {
  const doneCount = lessons.filter((lesson) => done.includes(lesson.slug)).length;
  const nextIndex = lessons.findIndex((lesson) => !done.includes(lesson.slug));
  const index = nextIndex === -1 ? 0 : nextIndex;
  return {
    next: lessons[index],
    /** 1-based lesson number, for display. */
    number: index + 1,
    doneCount,
    started: doneCount > 0,
    percent: lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0,
  };
}
