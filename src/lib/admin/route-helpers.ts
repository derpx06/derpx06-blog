import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin";
import { PAGE_ACCESS_COOKIE, verifyPageAccessToken } from "@/lib/auth/page-access";
import { clientKey, rateLimit } from "@/lib/auth/rate-limit";
import type { PublicUser } from "@/lib/auth/users";
import type { ContentSection } from "@/types/content.types";

/**
 * The preamble every /api/admin/* route runs.
 *
 * `src/proxy.ts` excludes /api from its matcher — each route guards itself — so
 * this is the only thing standing in front of the CMS.
 */

export type Guarded = { user: PublicUser };

/**
 * Authenticate, authorise and rate-limit in one call. Returns a `NextResponse`
 * to return as-is when the request is refused, or the admin when it is allowed.
 */
export async function guardAdminRequest(
  request: Request,
  scope: string,
  limit = 120,
): Promise<NextResponse | Guarded> {
  if (!rateLimit(clientKey(request, `admin:${scope}`), limit, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  const guard = await adminGuard();
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  return { user: guard.user };
}

export function isResponse(value: NextResponse | Guarded): value is NextResponse {
  return value instanceof NextResponse;
}

/**
 * Second factor for the irreversible actions — purging a document, deleting a
 * course. Being signed in as an admin is not enough on its own: a borrowed
 * session should not be able to destroy content, so these also require the
 * site's page-access password, entered fresh.
 */
export async function requireReauth(request: Request): Promise<NextResponse | null> {
  const cookie = request.headers.get("cookie") || "";
  const match = new RegExp(`(?:^|;\\s*)${PAGE_ACCESS_COOKIE}=([^;]+)`).exec(cookie);

  if (!verifyPageAccessToken(match?.[1] ? decodeURIComponent(match[1]) : null)) {
    return NextResponse.json(
      { error: "Confirm the site password before deleting.", needsReauth: true },
      { status: 428 },
    );
  }
  return null;
}

/**
 * Content routes are ISR at `revalidate = 300`, so without this an edit takes up
 * to five minutes to show. Rebuilds every page the piece can appear on, not just
 * its own — a title change moves through the archives, rails and sitemap too.
 *
 * Both forms are used deliberately, per Next's rules for `revalidatePath`:
 * a literal path takes no `type`, while a route pattern with a dynamic segment
 * requires one. The pattern is what clears a *cached 404* — a page fetched while
 * the piece was still a draft caches its own not-found, and revalidating the
 * concrete path alone does not shift it.
 */
const SECTION_PATTERNS: Record<ContentSection, string[]> = {
  blog: ["/blog/[slug]"],
  explainers: ["/explainers/[slug]"],
  work: ["/work/[slug]"],
  // A learn document is a lesson body, reachable only through its course.
  learn: ["/learn/[courseSlug]/[lessonSlug]", "/learn/[courseSlug]"],
};

function revalidate(path: string, type?: "page" | "layout") {
  try {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  } catch (error) {
    console.error(`Revalidating ${path} failed:`, error);
  }
}

export function revalidateContent(section: ContentSection, slug?: string) {
  // Literal paths: the listings and rails that carry titles and counts.
  for (const path of ["/", "/sitemap.xml", `/${section}`, "/saved"]) revalidate(path);
  if (slug) revalidate(`/${section}/${slug}`);

  // Route patterns: clears every generated page for the section, including a
  // cached not-found for a slug that has only just been published.
  for (const pattern of SECTION_PATTERNS[section]) revalidate(pattern, "page");
}

export function revalidateCourses(slug?: string) {
  for (const path of ["/", "/learn", "/sitemap.xml"]) revalidate(path);
  if (slug) revalidate(`/learn/${slug}`);

  revalidate("/learn/[courseSlug]", "page");
  revalidate("/learn/[courseSlug]/[lessonSlug]", "page");
}

/** Parses a JSON body, returning null rather than throwing on bad input. */
export async function readJson<T>(request: Request): Promise<T | null> {
  return (await request.json().catch(() => null)) as T | null;
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(what: string, error: unknown) {
  console.error(`${what} failed:`, error);
  const message = error instanceof Error ? error.message : "Something went wrong";
  return NextResponse.json({ error: message }, { status: 500 });
}
