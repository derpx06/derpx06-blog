"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes, protectedRoutes } from "@/resources";
import NotFound from "@/app/not-found";

const PREFIXES = ["/blog", "/learn", "/explainers"] as const;

function routeEnabled(pathname: string) {
  if (pathname in routes) return routes[pathname as keyof typeof routes];
  if (PREFIXES.some((p) => pathname.startsWith(p) && routes[p])) return true;
  // routes not listed in config (saved, signin, api pages) are always on
  return !Object.keys(routes).some((r) => r !== "/" && pathname.startsWith(r));
}

/** Renders children immediately. Only paths listed in protectedRoutes get the password gate. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const needsPassword = !!protectedRoutes[pathname as keyof typeof protectedRoutes];
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!needsPassword) return;
    fetch("/api/check-auth").then((r) => setAuthed(r.ok)).catch(() => setAuthed(false));
  }, [needsPassword, pathname]);

  if (!routeEnabled(pathname)) return <NotFound />;
  if (!needsPassword || authed) return <>{children}</>;
  if (authed === null) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await fetch("/api/authenticate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (r.ok) setAuthed(true); else setError("Incorrect password");
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: "120px auto", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 className="h2">This page is password protected</h1>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" placeholder="Password" style={{ height: 44, borderRadius: 10, border: "1px solid var(--line-strong)", padding: "0 14px", background: "var(--card)", color: "inherit", font: "inherit" }} />
      {error && <span style={{ color: "#dc2626", fontSize: 13 }}>{error}</span>}
      <button type="submit" className="btnPrimary">Unlock</button>
    </form>
  );
}
