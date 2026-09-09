import { readSnapshot, SNAPSHOT_FILE } from "./content-snapshot";

/**
 * Content lives only in MongoDB. If the database is unreachable while pages are
 * being prerendered, every query returns nothing — and without this the build
 * would succeed and ship an empty site.
 *
 * There are two ways that can go. If `content-snapshot.json` is committed, the
 * build falls back to it: a network blip between the builder and Atlas should
 * not block a deploy that has nothing to do with content. If it is missing too,
 * there is genuinely nothing to serve, so the build fails loudly rather than
 * shipping an empty site.
 *
 * At runtime neither applies: serve what we can and log the rest, rather than
 * 500 a page because one query blipped.
 */

let warned = false;

export function isBuilding(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Returns true when the caller should fall back to the snapshot. Throws when a
 * build has no fallback available.
 */
export function failIfBuilding(what: string, cause: unknown): boolean {
  if (!isBuilding()) return false;

  const reason = cause instanceof Error ? cause.message : String(cause);

  if (readSnapshot()) {
    if (!warned) {
      warned = true;
      console.warn(
        `\n⚠ MongoDB is unreachable during this build (${what}): ${reason}\n` +
          `  Falling back to ${SNAPSHOT_FILE}. The deploy will serve the content as of\n` +
          "  the last `npm run content:snapshot`, which may be stale.\n",
      );
    }
    return true;
  }

  throw new Error(
    `Cannot reach MongoDB while building (${what}): ${reason}\n` +
      "The site has no local content fallback, so this build would deploy empty.\n" +
      `Check MONGODB_URI, and that this host is allowed in Atlas → Network Access.\n` +
      `To make a build survive this, commit a ${SNAPSHOT_FILE} with \`npm run content:snapshot\`.`,
  );
}
