import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isRouteEnabled, isRouteProtected } from "@/resources/route-policy";

/**
 * Next's proxy (the file convention formerly called middleware).
 *
 * `RouteGuard` decides what to *show*; this decides what the server is willing
 * to *send*. Without it a disabled section and a password-protected page still
 * returned 200 with their real HTML, because the guard is a client component
 * wrapping children that had already been rendered on the server — `curl` saw
 * everything the guard was hiding.
 *
 * The password check here is only the cheap cookie test. The form itself, and
 * the exchange for the cookie, stay in `RouteGuard` + `/api/authenticate`.
 */

const PAGE_ACCESS_COOKIE = "authToken";

/**
 * The signature check needs node:crypto, which the proxy cannot load, so this
 * only rejects a missing or obviously malformed token. `/api/check-auth`
 * re-verifies the HMAC properly before `RouteGuard` reveals anything.
 */
function looksLikeAccessToken(value: string | undefined): boolean {
  if (!value) return false;
  const separator = value.lastIndexOf(".");
  if (separator < 1) return false;

  const expiry = Number(value.slice(0, separator));
  return Number.isFinite(expiry) && expiry > Date.now() && value.length > separator + 1;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isRouteEnabled(pathname)) {
    // /blocked calls notFound(), which produces a real 404 with the site's
    // own not-found page. The requested route is never rendered.
    return NextResponse.rewrite(new URL("/blocked", request.url));
  }

  if (isRouteProtected(pathname)) {
    const token = request.cookies.get(PAGE_ACCESS_COOKIE)?.value;
    if (!looksLikeAccessToken(token)) {
      // The URL is preserved across a rewrite, so unlocking and reloading
      // lands on the page that was asked for. The page HTML is never produced.
      return NextResponse.rewrite(new URL("/locked", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next's internals, the API (each route guards itself) and static files.
  // Proxy runs before rendering, so anything matched here never reaches a page.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|svg|trademarks|resume).*)"],
};
