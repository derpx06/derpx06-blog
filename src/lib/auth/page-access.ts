import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * The password gate on `protectedRoutes`. This used to set a fixed literal
 * cookie value, which meant sending that string was enough to pass — the gate
 * checked nothing. The token is now an HMAC over its own expiry, so it cannot
 * be produced without the server secret and cannot be replayed forever.
 *
 * Unrelated to reader accounts, which have their own sessions in `./session`.
 */

export const PAGE_ACCESS_COOKIE = "authToken";
export const PAGE_ACCESS_MAX_AGE_SECONDS = 60 * 60;

/** Falls back to the password itself so the gate still works if only it is set. */
function secret(): string | null {
  return process.env.PAGE_ACCESS_SECRET || process.env.PAGE_ACCESS_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Constant-time compare of two strings of any length. */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  // timingSafeEqual throws on a length mismatch, so compare digests instead —
  // equal-length by construction, and the lengths themselves stay hidden.
  const leftDigest = createHmac("sha256", "compare").update(left).digest();
  const rightDigest = createHmac("sha256", "compare").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function issuePageAccessToken(now: number = Date.now()): string | null {
  const key = secret();
  if (!key) return null;

  const expiresAt = String(now + PAGE_ACCESS_MAX_AGE_SECONDS * 1000);
  return `${expiresAt}.${sign(expiresAt, key)}`;
}

export function verifyPageAccessToken(
  token: string | null | undefined,
  now: number = Date.now(),
): boolean {
  const key = secret();
  if (!key || !token) return false;

  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  if (!safeEqual(signature, sign(expiresAt, key))) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}
