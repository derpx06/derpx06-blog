"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * There was no error boundary anywhere in the app, so anything that threw
 * during render — most realistically a malformed article body reaching the MDX
 * compiler — fell through to the framework's bare 500 page.
 *
 * The message is deliberately generic: `error.message` from a server component
 * is redacted in production anyway, and the digest is the thing worth quoting.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main id="main" style={{ padding: "96px var(--gut) 120px", maxWidth: "52ch" }}>
      <span className="ds-kickq" style={{ marginBottom: 14 }}>
        Something broke
      </span>
      <h1 className="ds-t-page" style={{ marginBottom: 16 }}>
        This page didn’t load
      </h1>
      <p className="ds-dek" style={{ marginBottom: 24 }}>
        The rest of the site is fine. Try again, or head back to the writing.
      </p>
      <div className="ds-row" style={{ gap: 10 }}>
        <button type="button" className="ds-box ds-dark" onClick={reset}>
          Try again
        </button>
        <Link href="/blog" className="ds-box">
          All writing
        </Link>
      </div>
      {error.digest && (
        <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 22 }}>
          Reference: {error.digest}
        </span>
      )}
    </main>
  );
}
