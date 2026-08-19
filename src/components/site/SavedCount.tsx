"use client";

import Link from "next/link";
import { useReader } from "./ReaderProvider";

export function SavedCount() {
  const { ready, signedIn, saved } = useReader();

  // Before the state lands, show the neutral affordance rather than "Saved 0".
  if (!ready) return <span className="ds-box ds-ghost">Saved</span>;
  if (!signedIn) {
    return (
      <Link href="/signin" className="ds-box">
        Sign in
      </Link>
    );
  }

  return (
    <Link href="/saved" className="ds-box">
      Saved {saved.length}
    </Link>
  );
}
