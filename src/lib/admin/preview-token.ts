import { createHmac, timingSafeEqual } from "node:crypto";
import type { ContentSection } from "@/types/content.types";

/**
 * Signed, expiring links for viewing a draft through the real article template.
 *
 * A draft is not published, so nothing on the site will render it — but a
 * preview must not become a way to read unpublished work by guessing a URL
 * either. The token names exactly one document and dies after 30 minutes.
 *
 * Same construction as `lib/auth/page-access.ts`: an HMAC over the payload,
 * with the expiry inside the signed part so it cannot be extended.
 */

export const PREVIEW_TTL_SECONDS = 30 * 60;

function secret(): string | null {
  return process.env.PAGE_ACCESS_SECRET || process.env.PAGE_ACCESS_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Constant-time compare over equal-length digests, so lengths do not leak. */
function safeEqual(a: string, b: string): boolean {
  const left = createHmac("sha256", "compare").update(a).digest();
  const right = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(left, right);
}

export type PreviewTarget = { section: ContentSection; slug: string };

export function issuePreviewToken(target: PreviewTarget, now: number = Date.now()): string | null {
  const key = secret();
  if (!key) return null;

  const expiresAt = now + PREVIEW_TTL_SECONDS * 1000;
  // The separator cannot appear in a section or a slug, so the payload parses
  // back unambiguously.
  const payload = `${target.section}:${target.slug}:${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload, key)}`;
}

export function verifyPreviewToken(
  token: string | null | undefined,
  now: number = Date.now(),
): PreviewTarget | null {
  const key = secret();
  if (!key || !token) return null;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;

  const encoded = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  if (!safeEqual(signature, sign(payload, key))) return null;

  const parts = payload.split(":");
  if (parts.length !== 3) return null;

  const [section, slug, expiresAt] = parts;
  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= now) return null;
  if (!section || !slug) return null;

  return { section: section as ContentSection, slug };
}
