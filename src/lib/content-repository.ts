import { connectToDatabase } from "@/lib/mongodb";
import { failIfBuilding } from "@/lib/build-guard";
import type {
  ContentMetadata,
  ContentRecord,
  ContentSection,
  ContentStatus,
  ContentTeamMember,
} from "@/types/content.types";

type ContentDocument = {
  section: ContentSection;
  slug: string;
  title?: string;
  summary?: string;
  body?: string;
  bodyFormat?: "mdx" | "html";
  status?: ContentStatus;
  published?: boolean;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  image?: string;
  images?: string[];
  tag?: string | string[];
  topics?: string[];
  team?: ContentTeamMember[];
  link?: string;
  source?: { type?: "mongodb" };
};

type ContentQueryOptions = {
  includeBody?: boolean;
  includeUnpublished?: boolean;
};

const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";

async function contentCollection() {
  const { db } = await connectToDatabase();
  return db.collection<ContentDocument>(collectionName);
}

function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeMetadata(metadata: Partial<ContentMetadata> = {}): ContentMetadata {
  return {
    title: metadata.title || "",
    publishedAt: normalizeDate(metadata.publishedAt),
    summary: metadata.summary || "",
    image: metadata.image || "",
    images: asArray(metadata.images),
    tag: Array.isArray(metadata.tag) ? metadata.tag[0] || "" : metadata.tag || "",
    topics: asArray(metadata.topics),
    team: asArray(metadata.team),
    link: metadata.link || "",
  };
}

function toRecord(document: ContentDocument, includeBody: boolean): ContentRecord {
  const status: ContentStatus = document.status || (document.published ? "published" : "draft");

  return {
    section: document.section,
    slug: document.slug,
    metadata: normalizeMetadata({
      title: document.title,
      summary: document.summary,
      publishedAt: normalizeDate(document.publishedAt || document.createdAt),
      image: document.image,
      images: document.images,
      tag: Array.isArray(document.tag) ? document.tag[0] : document.tag,
      topics: document.topics,
      team: document.team,
      link: document.link,
    }),
    content: includeBody ? document.body || "" : "",
    status,
    updatedAt: normalizeDate(document.updatedAt || document.publishedAt || document.createdAt),
    source: { type: "mongodb" },
  };
}

function projection(includeBody: boolean) {
  return includeBody ? { _id: 0 } : { _id: 0, body: 0 };
}

/* -------------------------------------------------------------------- reads */

export async function getContentList(
  section: ContentSection,
  options: ContentQueryOptions = {},
): Promise<ContentRecord[]> {
  const includeBody = options.includeBody === true;

  try {
    const collection = await contentCollection();
    const documents = await collection
      .find({ section, status: "published" }, { projection: projection(includeBody) })
      .sort({ publishedAt: -1 })
      .toArray();

    return documents.map((document) => toRecord(document, includeBody));
  } catch (error) {
    failIfBuilding(`${section} content`, error);
    console.error(`Failed to fetch ${section} content from MongoDB:`, error);
    return [];
  }
}

export async function getContentBySlug(
  section: ContentSection,
  slug: string,
  options: ContentQueryOptions = {},
): Promise<ContentRecord | null> {
  const includeBody = options.includeBody !== false;

  try {
    const collection = await contentCollection();
    const filter = options.includeUnpublished
      ? { section, slug }
      : { section, slug, status: "published" as ContentStatus };

    const document = await collection.findOne(filter, { projection: projection(includeBody) });
    return document ? toRecord(document, includeBody) : null;
  } catch (error) {
    failIfBuilding(`${section}/${slug}`, error);
    console.error(`Failed to fetch ${section}/${slug} from MongoDB:`, error);
    return null;
  }
}

/** Several slugs at once, returned in the order asked for. */
export async function getContentBySlugs(
  section: ContentSection,
  slugs: string[],
  options: ContentQueryOptions = {},
): Promise<ContentRecord[]> {
  if (slugs.length === 0) return [];
  const includeBody = options.includeBody !== false;

  try {
    const collection = await contentCollection();
    const documents = await collection
      .find(
        { section, slug: { $in: slugs }, status: "published" },
        { projection: projection(includeBody) },
      )
      .toArray();

    const bySlug = new Map(documents.map((document) => [document.slug, document]));
    return slugs.flatMap((slug) => {
      const document = bySlug.get(slug);
      return document ? [toRecord(document, includeBody)] : [];
    });
  } catch (error) {
    failIfBuilding(`${section} lessons`, error);
    console.error(`Failed to fetch ${section} content from MongoDB:`, error);
    return [];
  }
}

export async function getContentDrafts(section: ContentSection = "blog") {
  try {
    const collection = await contentCollection();
    const documents = await collection
      .find({ section, status: "draft" }, { projection: projection(true) })
      .sort({ updatedAt: -1 })
      .toArray();

    return documents.map((document) => toRecord(document, true));
  } catch (error) {
    console.error(`Failed to fetch ${section} drafts from MongoDB:`, error);
    return [];
  }
}

export async function getPublishedContentRoutes(section: ContentSection) {
  const records = await getContentList(section);
  return records.map((record) => record.slug);
}

/* ------------------------------------------------------------------- writes */

function slugFromTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export type SaveContentInput = {
  section?: ContentSection;
  slug?: string;
  title: string;
  summary?: string;
  content: string;
  bodyFormat?: "mdx" | "html";
  image?: string;
  tag?: string;
  topics?: string[];
  publish?: boolean;
};

/** Upsert an article. Used by the local editor — the only writer of content. */
export async function saveContent(input: SaveContentInput): Promise<ContentRecord> {
  const section = input.section ?? "blog";
  const slug = (input.slug || slugFromTitle(input.title)).trim();
  if (!slug) throw new Error("A title or slug is required");

  const collection = await contentCollection();
  const now = new Date();
  const status: ContentStatus = input.publish ? "published" : "draft";
  const existing = await collection.findOne({ section, slug });

  const document: ContentDocument = {
    section,
    slug,
    title: input.title,
    summary: input.summary ?? "",
    body: input.content,
    bodyFormat: input.bodyFormat ?? "mdx",
    status,
    published: status === "published",
    // A re-publish must not reset the original date.
    publishedAt:
      status === "published" ? (existing?.publishedAt ?? now) : (existing?.publishedAt ?? null),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    image: input.image ?? existing?.image ?? "",
    images: existing?.images ?? [],
    tag: input.tag ?? existing?.tag ?? "",
    topics: input.topics ?? existing?.topics ?? [],
    team: existing?.team ?? [],
    link: existing?.link ?? "",
    source: { type: "mongodb" },
  };

  await collection.updateOne({ section, slug }, { $set: document }, { upsert: true });

  return toRecord(document, true);
}
