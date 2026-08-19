import fs from "node:fs";
import path from "node:path";

const cache = new Map<string, boolean>();

/**
 * Returns the src only if it can actually be served. Content metadata is
 * hand-maintained, and a stale path otherwise reaches next/image as a 400 and
 * renders as a broken box.
 */
export function resolveImage(src?: string | null): string | null {
  if (!src) return null;
  if (/^https?:\/\//.test(src)) return src;
  if (!src.startsWith("/")) return null;

  const file = src.split(/[?#]/)[0];
  let exists = cache.get(file);
  if (exists === undefined) {
    try {
      exists = fs.existsSync(path.join(process.cwd(), "public", decodeURIComponent(file)));
    } catch {
      exists = false;
    }
    cache.set(file, exists);
  }

  return exists ? src : null;
}
