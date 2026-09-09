/**
 * Who counts as an admin, as pure logic.
 *
 * Kept apart from `./admin` because that module reaches `next/headers` through
 * the session lookup, which cannot be loaded outside a request — and this rule
 * is the one worth testing on its own.
 *
 * Normalisation is duplicated from `normalizeEmail` in `./users` rather than
 * imported, so this file pulls in nothing at all. The two must agree: an
 * address is matched case-insensitively and after trimming.
 */

function normalize(email: string): string {
  return (email || "").trim().toLowerCase();
}

/** Parsed on every call — the environment is the source of truth, not a cache. */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "").split(",").map(normalize).filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = adminEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(normalize(email));
}
