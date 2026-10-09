import { slugify as transliterate } from "transliteration";

/** Heading id generator shared by the MDX renderer and the TOC extractor so anchors always match. */
export function slugify(text: string): string {
  return transliterate(text.replace(/&/g, " and "), { lowercase: true, separator: "-" }).replace(/-{2,}/g, "-");
}
