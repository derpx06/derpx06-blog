"use client";

import { useState } from "react";

/**
 * The page-password prompt. Rendered by `/locked`, which the proxy
 * rewrites protected routes to before the real page is ever built, and by
 * `RouteGuard` as the client-side belt on the same braces.
 *
 * The URL is preserved across a proxy rewrite, so reloading after a
 * successful exchange lands on the page the reader actually asked for.
 */
export function PageAccessForm({ onUnlocked }: { onUnlocked?: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(undefined);

    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError(
          response.status === 429 ? "Too many attempts. Try again later." : "Incorrect password",
        );
        return;
      }

      if (onUnlocked) onUnlocked();
      else window.location.reload();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main" style={{ padding: "96px var(--gut) 120px", maxWidth: "44ch" }}>
      <h1 className="ds-t-page" style={{ marginBottom: 20 }}>
        This page is password protected
      </h1>
      <form className="ds-stack" style={{ gap: 10 }} onSubmit={submit}>
        <label className="ds-kickq" htmlFor="page-password">
          Password
        </label>
        <input
          id="page-password"
          className="ds-field"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ flex: "none" }}
        />
        {error && (
          <span className="ds-meta ds-meta-s" style={{ color: "var(--acc)" }} role="alert">
            {error}
          </span>
        )}
        <button type="submit" className="ds-box ds-dark" disabled={submitting}>
          {submitting ? "Checking…" : "Submit"}
        </button>
      </form>
    </main>
  );
}
