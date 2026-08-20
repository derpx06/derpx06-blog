"use client";

import Image from "next/image";
import Link from "next/link";
import { person } from "@/resources";
import { SaveButton } from "./SaveButton";
import { type ReaderTarget, useProgressReport, useScrollPercent } from "./ScrollProgress";

export type { ReaderTarget };

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
  const percent = useScrollPercent();
  useProgressReport(piece);

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
