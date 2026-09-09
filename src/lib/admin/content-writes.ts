import { slugify as transliterate } from "transliteration";
import { connectToDatabase } from "@/lib/mongodb";
import type {
  ContentBodyFormat,
  ContentRecord,
  ContentSection,
  ContentStatus,
  ContentTeamMember,
} from "@/types/content.types";

/**
 * Everything the CMS can do to a content document that `saveContent()` cannot.
 *
 * `saveContent` derives status from a boolean, so `"archived"` is unreachable;
 * it cannot set `publishedAt`, `images`, `team` or `link`; it has no delete; and
 * because `{section, slug}` is the upsert key, changing either one silently
 * creates a *second* document rather than moving the first.
 *
 * The `content` collection has a strict `$jsonSchema` with fifteen required
 * fields, `publishedAt` as a BSON `Date` (or null) and `tag` as a scalar string.
 * Every write here goes through `toDocument()` so that contract holds in one
 * place — scripts/import-content.mjs is the prior art it mirrors.
 */

export const SECTIONS: ContentSection[] = ["blog", "learn", "explainers", "work"];
export const STATUSES: ContentStatus[] = ["draft", "published", "archived"];

const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";

type ContentDocument = {
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  body: string;
  bodyFormat: ContentBodyFormat;
  status: ContentStatus;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  image: string;
  images: string[];
  tag: string;
  topics: string[];
  team: ContentTeamMember[];
  link: string;
  source: { type: "mongodb" };
};

async function contentCollection() {
  const { db } = await connectToDatabase();
  return db.collection<ContentDocument>(collectionName);
}

/**
 * Slug from a title. Transliterates first — the same `transliteration` package
 * `slugifyHeading` uses — so "Ünïcode" becomes "unicode" rather than "n-code".
 */
export function slugify(value: string): string {
  return transliterate(String(value ?? ""), { lowercase: true, separator: "-" })
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

/**
 * The validator types `tag` as a scalar string, but legacy documents can hold
 * an array. Writing one straight back rejects the whole document, so collapse
 * it — this is the bug latent in `saveContent`'s `?? existing?.tag` fallback.
 */
export function scalarTag(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
  return typeof value === "string" ? value : "";
}

/** Accepts an ISO string, a Date, or nothing. Never returns an invalid Date. */
export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

export type ContentWriteInput = {
  section: ContentSection;
  slug?: string;
  title: string;
  summary?: string;
  body?: string;
  bodyFormat?: ContentBodyFormat;
  status?: ContentStatus;
  publishedAt?: string | Date | null;
  image?: string;
  images?: string[];
  tag?: string;
  topics?: string[];
  team?: ContentTeamMember[];
  link?: string;
};

/**
 * Builds a document that satisfies the validator, merging over whatever is
 * already stored so a partial edit never blanks a field it did not mention.
 */
function toDocument(
  input: ContentWriteInput,
  existing: ContentDocument | null,
  now: Date,
): ContentDocument {
  const status: ContentStatus = input.status ?? existing?.status ?? "draft";
  const slug = (input.slug || existing?.slug || slugify(input.title)).trim();

  // An explicit date wins. Otherwise keep the original — a re-publish must not
  // reset it — and stamp `now` the first time a document goes live.
  const explicit = input.publishedAt === null ? null : toDate(input.publishedAt);
  const publishedAt =
    input.publishedAt !== undefined
      ? explicit
      : (toDate(existing?.publishedAt) ?? (status === "published" ? now : null));

  return {
    section: input.section,
    slug,
    title: input.title,
    summary: input.summary ?? existing?.summary ?? "",
    body: input.body ?? existing?.body ?? "",
    bodyFormat: input.bodyFormat ?? existing?.bodyFormat ?? "mdx",
    status,
    // Legacy mirror field. Kept so anything still reading it stays correct.
    published: status === "published",
    publishedAt,
    createdAt: toDate(existing?.createdAt) ?? now,
    updatedAt: now,
    image: input.image ?? existing?.image ?? "",
    images: input.images ? stringArray(input.images) : (existing?.images ?? []),
    tag: input.tag !== undefined ? scalarTag(input.tag) : scalarTag(existing?.tag),
    topics: input.topics ? stringArray(input.topics) : (existing?.topics ?? []),
    team: input.team ?? existing?.team ?? [],
    link: input.link ?? existing?.link ?? "",
    source: { type: "mongodb" },
  };
}

function toRecord(document: ContentDocument): ContentRecord {
  return {
    section: document.section,
    slug: document.slug,
    metadata: {
      title: document.title,
      publishedAt: document.publishedAt ? document.publishedAt.toISOString() : "",
      summary: document.summary,
      image: document.image,
      images: document.images,
      tag: document.tag,
      topics: document.topics,
      team: document.team,
      link: document.link,
    },
    content: document.body,
    bodyFormat: document.bodyFormat,
    status: document.status,
    updatedAt: document.updatedAt.toISOString(),
    source: { type: "mongodb" },
  };
}

/* --------------------------------------------------------------------- read */

export type ListFilter = {
  section?: ContentSection;
  status?: ContentStatus;
  search?: string;
  limit?: number;
  skip?: number;
};

export type ContentSummary = {
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  status: ContentStatus;
  tag: string;
  image: string;
  bodyFormat: ContentBodyFormat;
  publishedAt: string;
  updatedAt: string;
  words: number;
};

/** Admin listing: every status, every section, newest-edited first. */
export async function listContent(filter: ListFilter = {}) {
  const collection = await contentCollection();
  const query: Record<string, unknown> = {};

  if (filter.section) query.section = filter.section;
  if (filter.status) query.status = filter.status;
  if (filter.search) {
    // Escaped so a stray "(" from the search box cannot throw.
    const safe = filter.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(safe, "i");
    query.$or = [{ title: pattern }, { slug: pattern }, { summary: pattern }];
  }

  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const skip = Math.max(filter.skip ?? 0, 0);

  const [documents, total] = await Promise.all([
    collection
      .find(query, { projection: { _id: 0 } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query),
  ]);

  const items: ContentSummary[] = documents.map((document) => ({
    section: document.section,
    slug: document.slug,
    title: document.title || document.slug,
    summary: document.summary || "",
    status: document.status || "draft",
    tag: scalarTag(document.tag),
    image: document.image || "",
    bodyFormat: document.bodyFormat === "html" ? "html" : "mdx",
    publishedAt: document.publishedAt ? new Date(document.publishedAt).toISOString() : "",
    updatedAt: document.updatedAt ? new Date(document.updatedAt).toISOString() : "",
    words: (document.body || "").split(/\s+/).filter(Boolean).length,
  }));

  return { items, total, limit, skip };
}

/** One document at any status — the editor needs drafts and archived ones too. */
export async function getContentForAdmin(
  section: ContentSection,
  slug: string,
): Promise<ContentRecord | null> {
  const collection = await contentCollection();
  const document = await collection.findOne({ section, slug }, { projection: { _id: 0 } });
  if (!document) return null;
  return toRecord(toDocument({ ...document, body: document.body }, document, new Date()));
}

export async function countByStatus() {
  const collection = await contentCollection();
  const rows = await collection
    .aggregate<{ _id: { section: string; status: string }; count: number }>([
      { $group: { _id: { section: "$section", status: "$status" }, count: { $sum: 1 } } },
    ])
    .toArray();

  const counts: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const section = row._id.section ?? "unknown";
    const status = row._id.status ?? "draft";
    counts[section] ??= {};
    counts[section][status] = row.count;
  }
  return counts;
}

/* -------------------------------------------------------------------- write */

export class ContentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentConflictError";
  }
}

/** Create or update. The `{section, slug}` pair is the identity. */
export async function upsertContent(input: ContentWriteInput): Promise<ContentRecord> {
  if (!input.title?.trim()) throw new Error("A title is required");
  if (!SECTIONS.includes(input.section)) throw new Error("Unknown section");

  const collection = await contentCollection();
  const slug = (input.slug || slugify(input.title)).trim();
  if (!slug) throw new Error("A title or slug is required");

  const existing = await collection.findOne({ section: input.section, slug });
  const document = toDocument({ ...input, slug }, existing, new Date());

  await collection.updateOne(
    { section: document.section, slug: document.slug },
    { $set: document },
    { upsert: true },
  );

  return toRecord(document);
}

export type ContentAddress = { section: ContentSection; slug: string };

/**
 * Change a document's section or slug.
 *
 * `upsertContent` cannot do this: `{section, slug}` is the upsert key, so
 * writing a new one leaves the old document in place and the site ends up
 * serving both. This copies to the new address and removes the old one, after
 * checking the target is free — `content_section_slug_unique` would reject a
 * collision anyway, but a clear error beats a driver exception.
 */
export async function moveContent(from: ContentAddress, to: ContentAddress) {
  const collection = await contentCollection();

  if (from.section === to.section && from.slug === to.slug) {
    return getContentForAdmin(from.section, from.slug);
  }

  const source = await collection.findOne({ section: from.section, slug: from.slug });
  if (!source) throw new Error("That piece no longer exists");

  const clash = await collection.findOne({ section: to.section, slug: to.slug });
  if (clash) {
    throw new ContentConflictError(`${to.section}/${to.slug} already exists`);
  }

  const moved: ContentDocument = {
    ...source,
    section: to.section,
    slug: to.slug,
    updatedAt: new Date(),
  };

  await collection.insertOne(moved);
  await collection.deleteOne({ section: from.section, slug: from.slug });

  return toRecord(moved);
}

/** Publish, unpublish or archive. `publishedAt` is stamped once, then kept. */
export async function setContentStatus(
  address: ContentAddress,
  status: ContentStatus,
): Promise<ContentRecord> {
  if (!STATUSES.includes(status)) throw new Error("Unknown status");

  const collection = await contentCollection();
  const existing = await collection.findOne(address);
  if (!existing) throw new Error("That piece no longer exists");

  const now = new Date();
  const publishedAt =
    status === "published" ? (toDate(existing.publishedAt) ?? now) : toDate(existing.publishedAt);

  await collection.updateOne(address, {
    $set: { status, published: status === "published", publishedAt, updatedAt: now },
  });

  return toRecord({
    ...existing,
    status,
    published: status === "published",
    publishedAt,
    updatedAt: now,
  });
}

/**
 * The real delete. Everything the UI calls "delete" archives instead; this runs
 * only behind an explicit purge confirmation, and there is no undo.
 */
export async function deleteContent(address: ContentAddress): Promise<boolean> {
  const collection = await contentCollection();
  const result = await collection.deleteOne(address);
  return result.deletedCount === 1;
}
