"use client";

import throttle from "lodash.throttle";
import { useEffect, useRef, useState } from "react";
import { useReader } from "./ReaderProvider";

export type ReaderTarget = {
  slug: string;
  href: string;
  title: string;
  minutes: number;
  tag: string;
};

function scrollPercent(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
}

/** How far down the document the reader is, as a whole percent. */
export function useScrollPercent(): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const onScroll = () => setPercent(scrollPercent());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return percent;
}

/** Persists reading position for signed-in readers, throttled to one call per 5s. */
export function useProgressReport(piece: ReaderTarget): void {
  const { reportProgress, signedIn } = useReader();

  // Callers build `piece` inline, so it is a new object on every render. The
  // effect below used to depend on it directly, which meant it tore down and
  // re-subscribed each time — and its cleanup calls flush(), so every render
  // fired an extra progress write. Keying on the slug and reading the rest
  // through a ref subscribes once per article instead.
  const pieceRef = useRef(piece);
  pieceRef.current = piece;

  useEffect(() => {
    if (!signedIn) return;

    const send = () => reportProgress({ ...pieceRef.current, percent: scrollPercent() });
    const throttled = throttle(send, 5000, { leading: false, trailing: true });
    const onScroll = () => throttled();
    const flush = () => {
      throttled.cancel();
      send();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flush);
      flush();
    };
  }, [reportProgress, signedIn]);
}

/** The fixed hairline at the very top of the viewport, filling as you read. */
export function ScrollProgress({ piece }: { piece: ReaderTarget }) {
  const percent = useScrollPercent();
  useProgressReport(piece);

  return (
    <div className="ds-progress" aria-hidden="true">
      <i style={{ width: `${percent}%` }} />
    </div>
  );
}
