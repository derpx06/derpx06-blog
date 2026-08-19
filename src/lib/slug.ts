import { slugify as transliterate } from "transliteration";

/**
 * Heading id generator. Shared by the MDX heading renderer and the contents
 * rail so anchors and links can never drift apart.
 */
export function slugifyHeading(input: string): string {
  return transliterate(String(input ?? "").replace(/&/g, " and "), {
    lowercase: true,
    separator: "-",
  }).replace(/-{2,}/g, "-");
}
