"use client";

import Link from "next/link";
import { useReader } from "./ReaderProvider";

export function SavedList() {
  const { ready, signedIn, saved, toggleSaved } = useReader();

  if (!ready) return <p className="ds-dek">Loading your queue…</p>;

  if (!signedIn) {
    return (
      <div>
        <p className="ds-dek" style={{ marginBottom: 20 }}>
          Saved pieces live with your account, so they follow you between devices.
        </p>
        <div className="ds-wrap">
          <Link href="/signin?next=%2Fsaved" className="ds-box ds-dark">
            Sign in
          </Link>
          <Link href="/signup?next=%2Fsaved" className="ds-box">
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <p className="ds-dek">
        Nothing saved yet. Hit <em>Save</em> on any piece and it lands here.
      </p>
    );
  }

  const minutes = saved.reduce((total, item) => total + item.minutes, 0);

  return (
    <>
      <span className="ds-meta ds-meta-s" style={{ display: "block", marginBottom: 18 }}>
        {saved.length} saved · {minutes} min of reading
      </span>
      <div className="ds-stack">
        {saved.map((item, index) => (
          <article
            key={item.slug}
            className="ds-item"
            style={{
              alignItems: "baseline",
              gap: 16,
              borderBottom: index === saved.length - 1 ? "1px solid var(--rule-strong)" : undefined,
            }}
          >
            <span className="ds-num" style={{ width: 24 }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={item.href} className="ds-t-m ds-plain-link">
                {item.title}
              </Link>
              <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 4 }}>
                {item.minutes} min
              </span>
            </div>
            <button
              type="button"
              className="ds-save-italic"
              onClick={() => void toggleSaved(item)}
              aria-label={`Remove ${item.title} from your queue`}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
