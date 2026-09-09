import { slugifyHeading } from "./slug";

export type Heading = { id: string; text: string; level: 2 | 3 };

function push(headings: Heading[], text: string, level: 2 | 3) {
  const clean = text.trim();
  if (!clean) return;
  headings.push({ id: slugifyHeading(clean), text: clean, level });
}

/** Strips inline markdown emphasis and link syntax from a heading's text. */
function plain(text: string): string {
  return text
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

/**
 * Pulls the h2/h3 outline out of an article body for the contents rail.
 *
 * Markdown ATX headings only. There used to be an HTML `<h2>`/`<h3>` fallback
 * for bodies the TipTap editor saved as `bodyFormat: "html"`; that editor is
 * gone, every body is MDX, and `npm run content:check` fails any body with no
 * `##` headings — so the fallback had no producer left.
 */
export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];

  // Fenced code first, so a `# comment` inside a block is not a heading.
  const withoutCode = (body || "").replace(/```[\s\S]*?```/g, "");

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{2,3})\s+(.*\S)\s*$/.exec(line);
    if (match) push(headings, plain(match[2]), match[1].length === 2 ? 2 : 3);
  }

  return headings;
}
