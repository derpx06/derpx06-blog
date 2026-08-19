"use client";

import Link from "next/link";
import { useReader } from "./ReaderProvider";

/** The saved-pieces rail. Renders nothing until there is something in it. */
export function ReadingQueue({ limit = 3 }: { limit?: number }) {
  const { ready, saved } = useReader();
  if (!ready || saved.length === 0) return null;

  const shown = saved.slice(0, limit);
  const minutes = saved.reduce((total, item) => total + item.minutes, 0);

  return (
    <div>
      <span className="ds-kickq" style={{ marginBottom: 18 }}>
        Reading queue
      </span>
      <div
        className="ds-stack"
        style={{ gap: 10, font: "400 14px/1.35 var(--ds-sans)", color: "var(--body)" }}
      >
        {shown.map((item) => (
          <Link key={item.slug} href={item.href} style={{ color: "var(--body)" }}>
            {item.title}
          </Link>
        ))}
      </div>
      <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 12 }}>
        {saved.length} saved · {minutes} min
      </span>
    </div>
  );
}
