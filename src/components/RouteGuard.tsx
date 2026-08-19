"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotFound from "@/app/not-found";
import { protectedRoutes, routes } from "@/resources";

/**
 * `routes` switches whole sections off; anything it does not mention — /saved,
 * /signin, the editor — is a real page. The decision is pure config, so it is
 * made during render: every public page ships its real HTML, and only the
 * password-protected ones wait on a network check.
 */
function isRouteEnabled(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname in routes) return routes[pathname as keyof typeof routes];

  for (const [route, enabled] of Object.entries(routes)) {
    if (route !== "/" && pathname.startsWith(`${route}/`) && !enabled) return false;
  }
  return true;
}

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const enabled = isRouteEnabled(pathname);
  const needsPassword = Boolean(protectedRoutes[pathname as keyof typeof protectedRoutes]);

  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(needsPassword);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!needsPassword) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    setAuthenticated(false);

    fetch("/api/check-auth")
      .then((response) => {
        if (!cancelled) setAuthenticated(response.ok);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [needsPassword, pathname]);

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/authenticate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      setAuthenticated(true);
      setError(undefined);
    } else {
      setError("Incorrect password");
    }
  };

  if (!enabled) return <NotFound />;

  if (needsPassword && checking) {
    return (
      <div style={{ padding: "128px var(--gut)", textAlign: "center" }}>
        <span className="ds-meta">Checking access…</span>
      </div>
    );
  }

  if (needsPassword && !authenticated) {
    return (
      <main id="main" style={{ padding: "96px var(--gut) 120px", maxWidth: "44ch" }}>
        <h1 className="ds-t-page" style={{ marginBottom: 20 }}>
          This page is password protected
        </h1>
        <form className="ds-stack" style={{ gap: 10 }} onSubmit={submitPassword}>
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
          <button type="submit" className="ds-box ds-dark">
            Submit
          </button>
        </form>
      </main>
    );
  }

  return <>{children}</>;
};

export { RouteGuard };
