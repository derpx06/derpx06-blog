"use client";

import Link from "next/link";
import { resumeFrom, useReader } from "./ReaderProvider";

/** "Pick up where you left off" — hidden entirely when there is nothing to resume. */
export function ResumeStrip({ compact = false }: { compact?: boolean }) {
  const { ready, progress } = useReader();
  const entry = ready ? resumeFrom(progress) : null;
  if (!entry) return null;

  const remaining = Math.max(1, Math.round(entry.minutes * (1 - entry.percent / 100)));

  if (compact) {
    return (
      <div className="ds-tint ds-resume-compact">
        <span className="ds-kickq" style={{ marginBottom: 8 }}>
          Pick up where you left off
        </span>
        <div className="ds-t-xs" style={{ marginBottom: 10 }}>
          {entry.title}
        </div>
        <div className="ds-bar" style={{ height: 4, marginBottom: 8 }}>
          <i style={{ width: `${entry.percent}%` }} />
        </div>
        <div className="ds-between">
          <span className="ds-meta ds-meta-xs">
            {entry.percent}% · {remaining} min left
          </span>
          <Link href={entry.href} className="ds-box ds-dark ds-sm">
            Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-tint ds-resume">
      <span className="ds-kickq" style={{ whiteSpace: "nowrap" }}>
        Pick up where you left off
      </span>
      <div className="ds-ser ds-resume-title">{entry.title}</div>
      <div className="ds-resume-meter">
        <div className="ds-bar" style={{ height: 4 }}>
          <i style={{ width: `${entry.percent}%` }} />
        </div>
        <span className="ds-meta ds-meta-xs" style={{ marginTop: 6, display: "block" }}>
          {entry.percent}% · {remaining} min left
        </span>
      </div>
      <Link href={entry.href} className="ds-box ds-dark" style={{ flex: "none" }}>
        Continue
      </Link>
    </div>
  );
}
