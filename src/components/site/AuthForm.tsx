"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./auth.module.scss";

type Mode = "signin" | "signup";

/** Shared sign-in / sign-up form; sits inside the dark card on /signin and /signup. */
export function AuthForm({ mode }: { mode: Mode }) {
  const [next, setNext] = useState("/");

  // Same reason as the archive: keep the form in the server-rendered HTML.
  useEffect(() => {
    const target = new URLSearchParams(window.location.search).get("next");
    if (target?.startsWith("/")) setNext(target);
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { email, password, name } : { email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong.");

      // Full navigation so the reader state provider refetches with the cookie.
      window.location.assign(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const other = `${mode === "signup" ? "/signin" : "/signup"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <form className={s.form} onSubmit={submit}>
      {mode === "signup" && (
        <>
          <label className={s.label} htmlFor="auth-name">
            Name
          </label>
          <input
            id="auth-name"
            className={s.field}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </>
      )}

      <label className={s.label} htmlFor="auth-email">
        Email
      </label>
      <input
        id="auth-email"
        className={s.field}
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />

      <label className={s.label} htmlFor="auth-password">
        Password
      </label>
      <input
        id="auth-password"
        className={s.field}
        type="password"
        required
        minLength={mode === "signup" ? 8 : undefined}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />
      {mode === "signup" && <span className={s.hint}>At least 8 characters.</span>}

      {error && (
        <span className={s.error} role="alert">
          {error}
        </span>
      )}

      <button type="submit" className={`btnAccent ${s.submit}`} disabled={busy}>
        {busy ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>

      <span className={s.alt}>
        {mode === "signup" ? (
          <>
            Already have an account? <Link href={other}>Sign in</Link>
          </>
        ) : (
          <>
            No account yet? <Link href={other}>Create one</Link>
          </>
        )}
      </span>
    </form>
  );
}
