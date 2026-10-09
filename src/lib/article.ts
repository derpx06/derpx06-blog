import { slugify } from "./slug";

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** h2/h3 headings from MDX source, skipping fenced code. Ids match what the renderer produces. */
export function extractToc(mdx: string): TocItem[] {
  const out: TocItem[] = [];
  let inFence = false;
  for (const raw of mdx.split("\n")) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*_`~]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
    out.push({ id: slugify(text), text, level: m[1].length as 2 | 3 });
  }
  return out;
}

export function readingTime(mdx: string): number {
  const words = mdx.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

type Meta = { title: string; publishedAt: string; summary: string; tag?: string | string[]; topics?: string[] };
export type PostLike = { slug: string; metadata: Meta; content: string };

const tagOf = (m: Meta) => (Array.isArray(m.tag) ? m.tag[0] : m.tag) || "";

/** Up to `n` other posts sharing tag/topics, newest first as tie-break. */
export function relatedPosts<T extends PostLike>(all: T[], current: T, n = 3): T[] {
  const topics = new Set(current.metadata.topics ?? []);
  const tag = tagOf(current.metadata);
  return all
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      p,
      score: (tagOf(p.metadata) && tagOf(p.metadata) === tag ? 2 : 0) + (p.metadata.topics ?? []).filter((t) => topics.has(t)).length,
      time: new Date(p.metadata.publishedAt).getTime() || 0,
    }))
    .sort((a, b) => b.score - a.score || b.time - a.time)
    .slice(0, n)
    .map((x) => x.p);
}

export function formatShortDate(date: string): string {
  const d = new Date(date.includes("T") ? date : `${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export { tagOf };
