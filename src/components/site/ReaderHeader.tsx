"use client";

import { SaveButton } from "./SaveButton";
import { type ReaderTarget, useProgressReport, useScrollPercent } from "./ScrollProgress";

export type { ReaderTarget };

/**
 * The reader's own controls, hung inside the shared masthead: the fixed
 * progress rule, the "38% · 9 min left" label that is the same measurement,
 * and Save. The bar renders for everyone; progress is only persisted when
 * signed in.
 */
export function ReaderProgress({ piece }: { piece: ReaderTarget }) {
  const percent = useScrollPercent();
  useProgressReport(piece);

  const remaining = Math.max(0, Math.round(piece.minutes * (1 - percent / 100)));

  return (
    <>
      <div className="ds-progress" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>
      <span className="ds-meta ds-meta-s ds-progress-label" role="status">
        {percent}% · {remaining} min left
      </span>
      <SaveButton piece={piece} />
    </>
  );
}
