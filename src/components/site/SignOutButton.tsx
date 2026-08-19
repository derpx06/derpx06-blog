"use client";

import { useReader } from "./ReaderProvider";

export function SignOutButton() {
  const { ready, signedIn, user } = useReader();
  if (!ready || !signedIn) return null;

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  };

  return (
    <div className="ds-row">
      <span className="ds-meta ds-meta-s">Signed in as {user?.email}</span>
      <button type="button" className="ds-box" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
