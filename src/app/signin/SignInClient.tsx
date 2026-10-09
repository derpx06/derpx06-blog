"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Icon } from "@/components/site/icons";

export function SignInClient({ callbackUrl, configured }: { callbackUrl: string; configured: boolean }) {
  const { status } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (status === "authenticated") router.replace(callbackUrl); }, [status, callbackUrl, router]);

  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="darkCard" style={{ maxWidth: 520, margin: "0 auto", padding: "40px 32px" }}>
        <span className="glow" aria-hidden="true" />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="eyebrow">Account</span>
          <h1 style={{ margin: 0, font: "800 clamp(28px,4vw,40px)/1.05 var(--font-archivo)", letterSpacing: "-0.04em", textWrap: "balance" }}>Sign in to keep your place.</h1>
          <p style={{ margin: 0, font: "400 15px/1.6 var(--font-archivo)", color: "#bab6b6", maxWidth: "44ch" }}>
            Your reading queue and course progress are stored on your account, so they follow you across devices. Nothing else is collected.
          </p>
          {configured ? (
            <button
              type="button"
              className="btn"
              disabled={busy || status === "loading"}
              onClick={() => { setBusy(true); signIn("google", { callbackUrl }); }}
              style={{ alignSelf: "flex-start", marginTop: 8, background: "#fff", color: "#201e1d", height: 48, padding: "0 22px", fontSize: 14 }}
            >
              <GoogleMark /> {busy ? "Redirecting…" : "Continue with Google"}
            </button>
          ) : (
            <p className="mono" style={{ margin: "8px 0 0", fontSize: 12, color: "#bab6b6" }}>Sign-in is temporarily unavailable.{process.env.NODE_ENV !== "production" && " (GOOGLE_CLIENT_ID missing)"}</p>
          )}
          <Link href={callbackUrl} style={{ alignSelf: "flex-start", marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, font: "600 13px/1 var(--font-archivo)", color: "#bab6b6" }}>
            <Icon name="chevronLeft" size={14} /> Back
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.5 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7.1l7.6 5.9c4.4-4.1 6.9-10.1 6.9-17z" />
      <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.7 24c0-1.6.3-3.1.8-4.6l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.9l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}
