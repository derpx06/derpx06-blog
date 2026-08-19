import type { ContentRecord, ContentSection } from "@/types/content.types";

/**
 * Pure shaping and formatting of content records — no database, no filesystem,
 * so the display rules can be exercised on their own.
 */

const WORDS_PER_MINUTE = 220;

export type Piece = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  tag: string;
  image: string;
  publishedAt: string;
  minutes: number;
  year: number;
};

/** Rough read time from the raw body. Code fences and markup are stripped. */
export function readingMinutes(body: string): number {
  const text = (body || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`|-]+/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const sectionPath: Record<ContentSection, string> = {
  blog: "/blog",
  learn: "/learn",
  explainers: "/explainers",
  work: "/work",
};

export function toPiece(record: ContentRecord): Piece {
  const publishedAt = record.metadata.publishedAt || "";
  const parsed = publishedAt ? new Date(publishedAt) : null;
  return {
    slug: record.slug,
    href: `${sectionPath[record.section]}/${record.slug}`,
    title: record.metadata.title || record.slug,
    summary: record.metadata.summary || "",
    tag: record.metadata.tag || record.metadata.topics?.[0] || "Notes",
    image: record.metadata.image || "",
    publishedAt,
    minutes: readingMinutes(record.content),
    year: parsed && !Number.isNaN(parsed.getTime()) ? parsed.getFullYear() : 0,
  };
}

export function tagCounts(pieces: Piece[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const piece of pieces) {
    counts.set(piece.tag, (counts.get(piece.tag) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function groupByYear(pieces: Piece[]): Array<{ year: number; pieces: Piece[] }> {
  const groups = new Map<number, Piece[]>();
  for (const piece of pieces) {
    const bucket = groups.get(piece.year);
    if (bucket) bucket.push(piece);
    else groups.set(piece.year, [piece]);
  }
  return [...groups.entries()]
    .map(([year, items]) => ({ year, pieces: items }))
    .sort((a, b) => b.year - a.year);
}

/** Same-tag first, then the rest in order — used for the related band. */
export function relatedTo(piece: Piece, pool: Piece[], limit = 3): Piece[] {
  const others = pool.filter((candidate) => candidate.slug !== piece.slug);
  const sameTag = others.filter((candidate) => candidate.tag === piece.tag);
  const rest = others.filter((candidate) => candidate.tag !== piece.tag);
  return [...sameTag, ...rest].slice(0, limit);
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatShortDate(value: string): string {
  return parseDate(value)?.toLocaleDateString("en-GB", { month: "short", day: "numeric" }) ?? "";
}

export function formatLongDate(value: string): string {
  return (
    parseDate(value)?.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) ?? ""
  );
}
