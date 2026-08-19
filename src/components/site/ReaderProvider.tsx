"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { resumePoint } from "@/lib/reader-selectors";
import type { CourseEntry, ProgressEntry, SavedEntry } from "@/lib/reader-selectors";

export type ReaderSnapshot = {
  signedIn: boolean;
  user: { id: string; email: string; name: string } | null;
  progress: Record<string, ProgressEntry>;
  saved: SavedEntry[];
  lessons: Record<string, CourseEntry>;
};

const EMPTY: ReaderSnapshot = {
  signedIn: false,
  user: null,
  progress: {},
  saved: [],
  lessons: {},
};

type ReaderContextValue = ReaderSnapshot & {
  /** False until the first /api/reader/state response lands. */
  ready: boolean;
  toggleSaved: (piece: Omit<SavedEntry, "savedAt">) => Promise<void>;
  reportProgress: (entry: Omit<ProgressEntry, "updatedAt">) => void;
  completeLesson: (courseSlug: string, lessonSlug: string) => void;
};

const ReaderContext = createContext<ReaderContextValue | null>(null);

async function post(path: string, body: unknown) {
  try {
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    /* offline or signed out — the optimistic state simply won't persist */
  }
}

/**
 * Pages render as static HTML; per-reader state arrives here on mount. That
 * keeps every content route cacheable and confines the personalised bits to
 * this one fetch.
 */
export function ReaderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ReaderSnapshot>(EMPTY);
  const [ready, setReady] = useState(false);
  // Mirrors `state` synchronously: setState updaters run later, so a callback
  // cannot read the post-update value from inside one.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reader/state")
      .then((response) => (response.ok ? response.json() : EMPTY))
      .then((data: ReaderSnapshot) => {
        if (!cancelled) setState({ ...EMPTY, ...data });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSaved = useCallback(async (piece: Omit<SavedEntry, "savedAt">) => {
    const exists = stateRef.current.saved.some((item) => item.slug === piece.slug);
    const nextSaved = !exists;

    setState((current) => ({
      ...current,
      saved: nextSaved
        ? [{ ...piece, savedAt: Date.now() }, ...current.saved.filter((i) => i.slug !== piece.slug)]
        : current.saved.filter((item) => item.slug !== piece.slug),
    }));

    await post("/api/reader/saved", { ...piece, saved: nextSaved });
  }, []);

  const reportProgress = useCallback((entry: Omit<ProgressEntry, "updatedAt">) => {
    setState((current) => {
      const previous = current.progress[entry.slug]?.percent ?? 0;
      if (entry.percent <= previous) return current;
      return {
        ...current,
        progress: {
          ...current.progress,
          [entry.slug]: { ...entry, updatedAt: Date.now() },
        },
      };
    });
    void post("/api/reader/progress", entry);
  }, []);

  const completeLesson = useCallback((courseSlug: string, lessonSlug: string) => {
    setState((current) => {
      const entry = current.lessons[courseSlug] ?? { done: [], last: "", updatedAt: 0 };
      const done = entry.done.includes(lessonSlug) ? entry.done : [...entry.done, lessonSlug];
      return {
        ...current,
        lessons: {
          ...current.lessons,
          [courseSlug]: { done, last: lessonSlug, updatedAt: Date.now() },
        },
      };
    });
    void post("/api/reader/lessons", { courseSlug, lessonSlug });
  }, []);

  const value = useMemo<ReaderContextValue>(
    () => ({ ...state, ready, toggleSaved, reportProgress, completeLesson }),
    [state, ready, toggleSaved, reportProgress, completeLesson],
  );

  return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>;
}

export function useReader(): ReaderContextValue {
  const value = useContext(ReaderContext);
  if (!value) throw new Error("useReader must be used inside <ReaderProvider>");
  return value;
}

/** Same rule the server uses, over the client's copy of the state. */
export function resumeFrom(progress: Record<string, ProgressEntry>): ProgressEntry | null {
  return resumePoint({ progress, saved: [], lessons: {} });
}
