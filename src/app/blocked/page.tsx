import { notFound } from "next/navigation";

/**
 * Where `proxy.ts` rewrites a route that `routes` has switched off.
 * Calling `notFound()` here is what makes the response a real 404 with the
 * site's own not-found page — previously a disabled section still answered 200
 * with its full HTML and was only hidden in the browser.
 */
export default function BlockedPage() {
  notFound();
}
