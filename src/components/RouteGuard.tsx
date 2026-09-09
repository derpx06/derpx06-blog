"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NotFound from "@/app/not-found";
import { PageAccessForm } from "@/components/site/PageAccessForm";
import { isRouteEnabled, isRouteProtected } from "@/resources/route-policy";

/**
 * The client-side half of the route policy. `src/proxy.ts` is what
 * actually enforces it — it rewrites a disabled or locked route before the
 * page is rendered, so the HTML never leaves the server. This keeps the
 * in-browser behaviour (client navigations, the password form) consistent with
 * that, reading the same config from `@/resources/route-policy`.
 */
const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const enabled = isRouteEnabled(pathname);
  const needsPassword = isRouteProtected(pathname);

  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(needsPassword);

  useEffect(() => {
    if (!needsPassword) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    setChecking(true);
    setAuthenticated(false);

    // Re-verifies the cookie's signature, which the proxy cannot do.
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
  }, [needsPassword]);

  if (!enabled) return <NotFound />;

  if (needsPassword && checking) {
    return (
      <div style={{ padding: "128px var(--gut)", textAlign: "center" }}>
        <span className="ds-meta">Checking access…</span>
      </div>
    );
  }

  if (needsPassword && !authenticated) {
    return <PageAccessForm onUnlocked={() => setAuthenticated(true)} />;
  }

  return <>{children}</>;
};

export { RouteGuard };
