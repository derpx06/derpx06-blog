"use client";

import throttle from "lodash.throttle";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { person } from "@/resources";
import { useReader } from "./ReaderProvider";
import { SaveButton } from "./SaveButton";

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

/**
 * The reader's sticky rule and header bar from screen 03 — one unit, because
 * the bar and the "38% · 9 min left" label are the same measurement.
 * The bar renders for everyone; progress is only persisted when signed in.
 */
export function ReaderHeader({
  piece,
  sectionLabel,
  sectionHref,
}: {
  piece: ReaderTarget;
  sectionLabel: string;
  sectionHref: string;
}) {
  const { reportProgress, signedIn } = useReader();
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

  useEffect(() => {
    if (!signedIn) return;

    const send = () => reportProgress({ ...piece, percent: scrollPercent() });
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
  }, [piece, reportProgress, signedIn]);

  const remaining = Math.max(0, Math.round(piece.minutes * (1 - percent / 100)));

  return (
    <>
      <div className="ds-progress" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>

      <div className="ds-reader-head">
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
          <Link href="/" className="ds-brand">
            <span className="ds-brand-mark" style={{ width: 26, height: 26 }}>
              <Image src="/icon.png" alt="" width={52} height={52} />
            </span>
            <span className="ds-ser" style={{ fontSize: 22, color: "var(--ink)" }}>
              {person.name.toLowerCase()}
            </span>
          </Link>
          <span className="ds-meta ds-meta-s">
            <Link href={sectionHref} style={{ color: "var(--mut)" }}>
              {sectionLabel}
            </Link>{" "}
            / {piece.tag}
          </span>
        </div>

        <div className="ds-row" style={{ gap: 16 }}>
          <span className="ds-meta ds-meta-s ds-progress-label" role="status">
            {percent}% · {remaining} min left
          </span>
          <SaveButton piece={piece} />
          <Link href="#newsletter" className="ds-box ds-dark">
            Subscribe
          </Link>
        </div>
      </div>
    </>
  );
}
