import type { ProtectedRoutesConfig, RoutesConfig } from "@/types";

/**
 * Which sections exist, and which need the page password.
 *
 * Kept out of `site.config.ts` on purpose: that module imports `next/font`,
 * which cannot be loaded in the proxy. Both this file's consumers — the
 * proxy that enforces the policy on the server and the `RouteGuard` that
 * renders the password form in the browser — read it from here, so the two can
 * never disagree. `site.config.ts` re-exports these, so existing imports of
 * `routes` / `protectedRoutes` from `@/resources` are unchanged.
 */

/** A deny-list: a path this does not mention is a live page. */
export const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": false,
  "/blog": true,
  "/gallery": false,
  "/explainers": true,
  "/learn": true,
};

// Password protection for selected routes. Set PAGE_ACCESS_PASSWORD in .env.
export const protectedRoutes: ProtectedRoutesConfig = {
  "/work/automate-design-handovers-with-a-figma-to-code-pipeline": true,
};

/** True when the path is a live page. Section prefixes are inherited. */
export function isRouteEnabled(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname in routes) return routes[pathname as keyof typeof routes];

  for (const [route, enabled] of Object.entries(routes)) {
    if (route !== "/" && pathname.startsWith(`${route}/`) && !enabled) return false;
  }
  return true;
}

export function isRouteProtected(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return Boolean(protectedRoutes[pathname as keyof typeof protectedRoutes]);
}
