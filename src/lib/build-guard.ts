/**
 * Content lives only in MongoDB. If the database is unreachable while pages are
 * being prerendered, every query returns nothing — and without this the build
 * would succeed and ship an empty site. Failing here turns a silent bad deploy
 * into a loud build error.
 *
 * At runtime the opposite is right: serve what we can and log the rest, rather
 * than 500 a page because one query blipped.
 */
export function failIfBuilding(what: string, cause: unknown): void {
  if (process.env.NEXT_PHASE !== "phase-production-build") return;

  const reason = cause instanceof Error ? cause.message : String(cause);
  throw new Error(
    `Cannot reach MongoDB while building (${what}): ${reason}\n` +
      "The site has no local content fallback, so this build would deploy empty.\n" +
      "Check MONGODB_URI, and that this host is allowed in Atlas → Network Access.",
  );
}
