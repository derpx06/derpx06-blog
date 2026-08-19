import { slugifyHeading } from "./slug";

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Pulls the h2/h3 outline out of a raw MDX body for the contents rail.
 * Fenced code is stripped first so a `# comment` inside a block is not
 * mistaken for a heading.
 */
export function extractHeadings(body: string): Heading[] {
  const withoutCode = (body || "").replace(/```[\s\S]*?```/g, "");
  const headings: Heading[] = [];

  for (const line of withoutCode.split("\n")) {
    const match = /^(#{2,3})\s+(.*\S)\s*$/.exec(line);
    if (!match) continue;

    const text = match[2]
      .replace(/[*_`]/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .trim();
    if (!text) continue;

    headings.push({ id: slugifyHeading(text), text, level: match[1].length === 2 ? 2 : 3 });
  }

  return headings;
}
