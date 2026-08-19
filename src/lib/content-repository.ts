import fs from "node:fs";
import path from "node:path";
import { getPosts } from "@/utils/utils";
import { connectToDatabase } from "@/lib/mongodb";
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
  source?: { type?: "mongodb" | "mdx"; path?: string };
};

type ContentStorageMode = "local" | "hybrid" | "mongodb";

type ContentQueryOptions = {
  includeBody?: boolean;
  includeUnpublished?: boolean;
};

const localPaths: Record<ContentSection, string[]> = {
  blog: ["src", "app", "blog", "posts"],
  learn: ["src", "app", "learn", "posts"],
  explainers: ["src", "app", "explainers", "posts"],
  work: ["src", "app", "work", "projects"],
};

const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";

function isMongoEnabled() {
  const value = (process.env.USE_MONGODB || "false").toLowerCase();
  return value === "1" || value === "true";
}

function storageMode(): ContentStorageMode {
  const configured = (process.env.CONTENT_STORAGE || "").toLowerCase();
  if (configured === "local" || configured === "hybrid" || configured === "mongodb") {
    return configured;
  }

  return isMongoEnabled() ? "hybrid" : "local";
}

function normalizeDate(value: unknown): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toISOString().slice(0, 10);
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeMetadata(metadata: Partial<ContentMetadata> = {}): ContentMetadata {
  const tag = Array.isArray(metadata.tag) ? metadata.tag[0] : metadata.tag;

  return {
    title: typeof metadata.title === "string" ? metadata.title : "",
    publishedAt: normalizeDate(metadata.publishedAt),
    summary: typeof metadata.summary === "string" ? metadata.summary : "",
    image: typeof metadata.image === "string" ? metadata.image : "",
    images: asArray(metadata.images),
    tag: typeof tag === "string" ? tag : "",
    topics: asArray(metadata.topics),
    team: asArray(metadata.team),
    link: typeof metadata.link === "string" ? metadata.link : "",
  };
}

function localRecord(section: ContentSection, post: any, status: ContentStatus = "published"): ContentRecord {
  return {
    section,
    slug: post.slug,
    metadata: normalizeMetadata(post.metadata),
    content: post.content || "",
    status,
    updatedAt: normalizeDate(post.metadata?.publishedAt),
    source: { type: "mdx", path: path.join(...localPaths[section], `${post.slug}.mdx`) },
  };
}

function localRecords(section: ContentSection, includeUnpublished = false): ContentRecord[] {
  const posts = getPosts(localPaths[section]);
  const records = posts.map((post) => localRecord(section, post));

  if (includeUnpublished && section === "blog") {
    const drafts = getPosts(["src", "app", "blog", "drafts"]);
    records.push(...drafts.map((post) => localRecord(section, post, "draft")));
  }

  return records;
}

function contentKey(section: ContentSection, slug: string) {
  return `${section}:${slug}`;
}

function documentToRecord(document: ContentDocument, includeBody: boolean): ContentRecord {
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
    source: { type: "mongodb", path: document.source?.path },
  };
}

function sortRecords(records: ContentRecord[]) {
  return records.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });
}

async function mongoDocuments(
  section: ContentSection,
  filter: Record<string, unknown>,
  includeBody: boolean,
) {
  const { db } = await connectToDatabase();
  const projection = includeBody ? undefined : { body: 0 };

  return db
    .collection<ContentDocument>(collectionName)
    .find({ section, ...filter }, projection ? { projection } : undefined)
    .sort({ publishedAt: -1, updatedAt: -1 })
    .toArray();
}

function mergeHybrid(
  local: ContentRecord[],
  documents: ContentDocument[],
  includeBody: boolean,
): ContentRecord[] {
  const dbRecords = documents.map((document) => documentToRecord(document, includeBody));
  const dbKeys = new Set(dbRecords.map((record) => contentKey(record.section, record.slug)));
  const databaseRecords = new Map(dbRecords.map((record) => [contentKey(record.section, record.slug), record]));
  const localVisible = local.filter((record) => {
    const key = contentKey(record.section, record.slug);
    return !dbKeys.has(key);
  });

  return sortRecords([...localVisible, ...databaseRecords.values()].filter((record) => record.status === "published"));
}

export function getContentStorageMode() {
  return storageMode();
}

export async function getContentList(
  section: ContentSection,
  options: ContentQueryOptions = {},
): Promise<ContentRecord[]> {
  const includeBody = options.includeBody === true;
  const mode = storageMode();
  const local = localRecords(section);

  if (mode === "local" || !isMongoEnabled()) return sortRecords(local);

  try {
    const documents = await mongoDocuments(
      section,
      mode === "hybrid" ? {} : { status: "published" },
      includeBody,
    );

    if (mode === "hybrid") return mergeHybrid(local, documents, includeBody);

    return sortRecords(
      documents
        .filter((document) => (document.status || (document.published ? "published" : "draft")) === "published")
        .map((document) => documentToRecord(document, includeBody)),
    );
  } catch (error) {
    console.error(`Failed to fetch ${section} content from MongoDB:`, error);
    return sortRecords(local);
  }
}

export async function getContentBySlug(
  section: ContentSection,
  slug: string,
  options: ContentQueryOptions = {},
): Promise<ContentRecord | null> {
  const includeBody = options.includeBody !== false;
  const mode = storageMode();
  const local = localRecords(section, options.includeUnpublished);
  const localMatch = local.find((record) => record.slug === slug) || null;

  if (mode === "local" || !isMongoEnabled()) {
    return options.includeUnpublished || localMatch?.status === "published" ? localMatch : null;
  }

  try {
    const documents = await mongoDocuments(
      section,
      options.includeUnpublished ? { slug } : { slug, status: "published" },
      includeBody,
    );
    const document = documents[0];

    if (document) {
      const record = documentToRecord(document, includeBody);
      return options.includeUnpublished || record.status === "published" ? record : null;
    }

    if (mode === "hybrid") {
      const anyDocument = await mongoDocuments(section, { slug }, false);
      if (anyDocument[0]) return null;
      return options.includeUnpublished || localMatch?.status === "published" ? localMatch : null;
    }

    return null;
  } catch (error) {
    console.error(`Failed to fetch ${section}/${slug} from MongoDB:`, error);
    return options.includeUnpublished || localMatch?.status === "published" ? localMatch : null;
  }
}

export async function getContentBySlugs(
  section: ContentSection,
  slugs: string[],
): Promise<ContentRecord[]> {
  if (slugs.length === 0) return [];

  const mode = storageMode();
  const local = localRecords(section);
  const localMap = new Map(local.map((record) => [record.slug, record]));

  if (mode === "local" || !isMongoEnabled()) {
    return slugs.map((slug) => localMap.get(slug)).filter(Boolean) as ContentRecord[];
  }

  try {
    const documents = await mongoDocuments(section, { slug: { $in: slugs } }, true);
    const databaseRecords = new Map(
      documents
        .filter((document) => (document.status || (document.published ? "published" : "draft")) === "published")
        .map((document) => {
          const record = documentToRecord(document, true);
          return [record.slug, record] as const;
        }),
    );
    const suppressedSlugs = new Set(
      documents
        .filter((document) => (document.status || (document.published ? "published" : "draft")) !== "published")
        .map((document) => document.slug),
    );

    return slugs
      .map((slug) => (
        databaseRecords.get(slug)
        || (mode === "hybrid" && !suppressedSlugs.has(slug) ? localMap.get(slug) : undefined)
      ))
      .filter(Boolean) as ContentRecord[];
  } catch (error) {
    console.error(`Failed to fetch ${section} content from MongoDB:`, error);
    return slugs.map((slug) => localMap.get(slug)).filter(Boolean) as ContentRecord[];
  }
}

export async function getContentDrafts(section: ContentSection = "blog") {
  const mode = storageMode();
  const local = localRecords(section, true).filter((record) => record.status === "draft");

  if (mode === "local" || !isMongoEnabled()) return local;

  try {
    const documents = await mongoDocuments(section, { status: "draft" }, true);
    const databaseRecords = documents.map((document) => documentToRecord(document, true));
    const keys = new Set(databaseRecords.map((record) => record.slug));
    return [...databaseRecords, ...local.filter((record) => !keys.has(record.slug))];
  } catch (error) {
    console.error(`Failed to fetch ${section} drafts from MongoDB:`, error);
    return local;
  }
}

export async function getPublishedContentRoutes(section: ContentSection) {
  const records = await getContentList(section);
  return records.map((record) => record.slug);
}

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
  /** Overrides DEFAULT_ARTICLE_STORAGE for this save. */
  storage?: "mongodb" | "mdx";
};

function defaultArticleStorage(): "mongodb" | "mdx" {
  const configured = (process.env.DEFAULT_ARTICLE_STORAGE || "").toLowerCase();
  if (configured === "mongodb" || configured === "mdx") return configured;
  return isMongoEnabled() ? "mongodb" : "mdx";
}

/** Writes an .mdx file into the section's posts (or blog drafts) directory. */
function saveContentToDisk(
  section: ContentSection,
  slug: string,
  input: SaveContentInput,
): ContentRecord {
  if (section !== "blog") {
    throw new Error("File storage currently supports blog articles only");
  }

  const directory = path.join(
    process.cwd(),
    ...(input.publish ? localPaths.blog : ["src", "app", "blog", "drafts"]),
  );
  fs.mkdirSync(directory, { recursive: true });

  const publishedAt = input.publish ? new Date().toISOString() : "";
  const escape = (value: string) => value.replace(/"/g, '\\"');
  const frontmatter = [
    "---",
    `title: "${escape(input.title)}"`,
    `summary: "${escape(input.summary ?? "")}"`,
    `publishedAt: "${publishedAt}"`,
    `image: "${escape(input.image ?? "")}"`,
    `tag: "${escape(input.tag ?? "")}"`,
    "---",
    "",
    "",
  ].join("\n");

  fs.writeFileSync(path.join(directory, `${slug}.mdx`), frontmatter + input.content, "utf8");

  return {
    section,
    slug,
    metadata: normalizeMetadata({
      title: input.title,
      summary: input.summary,
      publishedAt,
      image: input.image,
      tag: input.tag,
    }),
    content: input.content,
    status: input.publish ? "published" : "draft",
    updatedAt: new Date().toISOString(),
    source: { type: "mdx", path: path.join(...localPaths[section], `${slug}.mdx`) },
  };
}

/**
 * Upsert an article. Used by the local editor — the only writer of content in
 * the app. Storage follows DEFAULT_ARTICLE_STORAGE unless overridden.
 */
export async function saveContent(input: SaveContentInput): Promise<ContentRecord> {
  const section = input.section ?? "blog";
  const slug = (input.slug || slugFromTitle(input.title)).trim();
  if (!slug) throw new Error("A title or slug is required");

  if ((input.storage ?? defaultArticleStorage()) === "mdx") {
    return saveContentToDisk(section, slug, { ...input, slug });
  }

  const { db } = await connectToDatabase();
  const collection = db.collection<ContentDocument>(collectionName);

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
    publishedAt:
      status === "published"
        ? (existing?.publishedAt ?? now)
        : (existing?.publishedAt ?? null),
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

  return documentToRecord(document, true);
}
