import { slugify as transliterate } from "transliteration";
import { Int32 } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import type { Course, CourseLink, CourseStatus, CourseTopic } from "@/types/content.types";

/**
 * Course CRUD. The course repository is read-only — the three live courses were
 * created by a migration script that was deleted in c6e0cbf, so until now
 * editing one meant hand-editing Atlas.
 *
 * Two shapes matter here:
 *
 * 1. A course document carries `status`, `order`, timestamps and `source` on top
 *    of the app-facing `Course` type, which strips them.
 * 2. **Lesson order is array order.** There is no position field; reordering is
 *    rewriting `topics[].links[]`. Every mutation below rewrites the whole
 *    `topics` array for that reason.
 */

const collectionName = process.env.MONGODB_COURSE_COLLECTION || "courses";

type CourseDocument = Course & {
  status: CourseStatus;
  /**
   * Written as `Int32` to satisfy the validator's `bsonType: "int"`, read back
   * as a plain number — hence the union. `toAdminCourse` normalises it.
   */
  order: number | Int32;
  createdAt: Date;
  updatedAt: Date;
  source: { type: "mongodb" | "local"; path?: string };
};

async function courseCollection() {
  const { db } = await connectToDatabase();
  return db.collection<CourseDocument>(collectionName);
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
 * The validator declares `order` as `bsonType: "int"`, but the driver
 * serialises a plain JS number as a double, which strict validation rejects.
 * The deleted migration script got this wrong — which is itself the evidence
 * that the validator was never actually applied to the collection.
 */
function asInt(value: number): Int32 {
  return new Int32(Math.trunc(Number.isFinite(value) ? value : 0));
}

function toCourse(document: CourseDocument): Course {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    slug: document.slug,
    image: document.image,
    topics: document.topics ?? [],
  };
}

export type AdminCourse = Course & {
  status: CourseStatus;
  order: number;
  updatedAt: string;
  lessonCount: number;
};

function toAdminCourse(document: CourseDocument): AdminCourse {
  const topics = document.topics ?? [];
  return {
    ...toCourse(document),
    topics,
    status: document.status ?? "draft",
    order: Number(document.order ?? 0),
    updatedAt: document.updatedAt ? new Date(document.updatedAt).toISOString() : "",
    lessonCount: topics.reduce((total, topic) => total + (topic.links?.length ?? 0), 0),
  };
}

/* --------------------------------------------------------------------- read */

/**
 * Every course at every status. `getCourses()` filters to published, so a draft
 * course was previously invisible even to the person editing it.
 */
export async function listCoursesForAdmin(): Promise<AdminCourse[]> {
  const collection = await courseCollection();
  const documents = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ order: 1, slug: 1 })
    .toArray();
  return documents.map(toAdminCourse);
}

export async function getCourseForAdmin(slug: string): Promise<AdminCourse | null> {
  const collection = await courseCollection();
  const document = await collection.findOne({ slug }, { projection: { _id: 0 } });
  return document ? toAdminCourse(document) : null;
}

/* ---------------------------------------------------------- pure topic edits */

/*
 * These are pure so the ordering rules can be tested without a database.
 * Each returns a new topics array; callers persist it with `writeTopics`.
 */

/** Moves an array item, clamping the destination rather than throwing. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(Math.min(Math.max(to, 0), next.length), 0, item);
  return next;
}

export function addTopic(topics: CourseTopic[], title: string): CourseTopic[] {
  return [...topics, { title, links: [] }];
}

export function renameTopic(topics: CourseTopic[], index: number, title: string): CourseTopic[] {
  return topics.map((topic, i) => (i === index ? { ...topic, title } : topic));
}

export function removeTopic(topics: CourseTopic[], index: number): CourseTopic[] {
  return topics.filter((_, i) => i !== index);
}

export function addLesson(
  topics: CourseTopic[],
  topicIndex: number,
  lesson: CourseLink,
): CourseTopic[] {
  return topics.map((topic, i) =>
    i === topicIndex ? { ...topic, links: [...topic.links, lesson] } : topic,
  );
}

export function updateLesson(
  topics: CourseTopic[],
  topicIndex: number,
  lessonIndex: number,
  lesson: Partial<CourseLink>,
): CourseTopic[] {
  return topics.map((topic, i) =>
    i === topicIndex
      ? {
          ...topic,
          links: topic.links.map((link, j) => (j === lessonIndex ? { ...link, ...lesson } : link)),
        }
      : topic,
  );
}

export function removeLesson(
  topics: CourseTopic[],
  topicIndex: number,
  lessonIndex: number,
): CourseTopic[] {
  return topics.map((topic, i) =>
    i === topicIndex ? { ...topic, links: topic.links.filter((_, j) => j !== lessonIndex) } : topic,
  );
}

/** Moves a lesson within a topic, or across two topics, preserving order. */
export function moveLesson(
  topics: CourseTopic[],
  from: { topic: number; lesson: number },
  to: { topic: number; lesson: number },
): CourseTopic[] {
  const source = topics[from.topic];
  if (!source) return topics;
  const lesson = source.links[from.lesson];
  if (!lesson) return topics;

  if (from.topic === to.topic) {
    return topics.map((topic, i) =>
      i === from.topic ? { ...topic, links: moveItem(topic.links, from.lesson, to.lesson) } : topic,
    );
  }

  if (!topics[to.topic]) return topics;

  return topics.map((topic, i) => {
    if (i === from.topic) {
      return { ...topic, links: topic.links.filter((_, j) => j !== from.lesson) };
    }
    if (i === to.topic) {
      const links = [...topic.links];
      links.splice(Math.min(Math.max(to.lesson, 0), links.length), 0, lesson);
      return { ...topic, links };
    }
    return topic;
  });
}

/* ------------------------------------------------- referential integrity */

export type CourseReferenceProblem = {
  kind: "missing-post" | "duplicate-lesson-slug" | "empty-lesson" | "no-lessons";
  topic?: string;
  lesson?: string;
  detail: string;
};

/**
 * A lesson points at `learn` content by slug string and nothing enforces the
 * target exists: `getContentBySlugs` silently drops what it cannot find, and if
 * `postSlugs[0]` is missing the whole lesson 404s. This surfaces that before it
 * ships, given the set of slugs that actually resolve.
 */
export function validateCourseReferences(
  topics: CourseTopic[],
  publishedLearnSlugs: Set<string>,
): CourseReferenceProblem[] {
  const problems: CourseReferenceProblem[] = [];
  const seen = new Map<string, string>();
  let lessons = 0;

  for (const topic of topics) {
    for (const link of topic.links ?? []) {
      lessons += 1;

      const previous = seen.get(link.slug);
      if (previous) {
        problems.push({
          kind: "duplicate-lesson-slug",
          topic: topic.title,
          lesson: link.slug,
          detail: `"${link.slug}" is used twice (${previous} and ${topic.title}) — only the first is reachable`,
        });
      } else {
        seen.set(link.slug, topic.title);
      }

      if (!link.postSlugs || link.postSlugs.length === 0) {
        problems.push({
          kind: "empty-lesson",
          topic: topic.title,
          lesson: link.slug,
          detail: `"${link.title}" has no content attached — the page will 404`,
        });
        continue;
      }

      for (const [index, postSlug] of link.postSlugs.entries()) {
        if (publishedLearnSlugs.has(postSlug)) continue;
        problems.push({
          kind: "missing-post",
          topic: topic.title,
          lesson: link.slug,
          detail:
            index === 0
              ? `"${link.title}" points at learn/${postSlug}, which is not published — the lesson will 404`
              : `"${link.title}" also points at learn/${postSlug}, which is not published — that part will be missing`,
        });
      }
    }
  }

  if (lessons === 0) {
    problems.push({ kind: "no-lessons", detail: "This course has no lessons yet" });
  }

  return problems;
}

/* -------------------------------------------------------------------- write */

export class CourseConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourseConflictError";
  }
}

export type CourseWriteInput = {
  slug?: string;
  title: string;
  description?: string;
  image?: string;
  status?: CourseStatus;
  order?: number;
  topics?: CourseTopic[];
};

export async function upsertCourse(input: CourseWriteInput): Promise<AdminCourse> {
  if (!input.title?.trim()) throw new Error("A title is required");

  const collection = await courseCollection();
  const slug = (input.slug || slugify(input.title)).trim();
  if (!slug) throw new Error("A title or slug is required");

  const existing = await collection.findOne({ slug });
  const now = new Date();

  // New courses go to the end of the rail rather than fighting for position 0.
  const order = input.order ?? existing?.order ?? (await collection.countDocuments({}));

  const document = {
    id: existing?.id ?? slug,
    slug,
    title: input.title,
    description: input.description ?? existing?.description ?? "",
    image: input.image ?? existing?.image ?? "",
    topics: input.topics ?? existing?.topics ?? [],
    status: input.status ?? existing?.status ?? "draft",
    order: asInt(Number(order)),
    createdAt: existing?.createdAt ? new Date(existing.createdAt) : now,
    updatedAt: now,
    source: { type: "mongodb" as const },
  };

  await collection.updateOne({ slug }, { $set: document }, { upsert: true });

  return toAdminCourse(document);
}

/** Rewrites the whole topics array — every structural edit routes through here. */
export async function writeTopics(slug: string, topics: CourseTopic[]): Promise<AdminCourse> {
  const collection = await courseCollection();
  const now = new Date();

  const result = await collection.findOneAndUpdate(
    { slug },
    { $set: { topics, updatedAt: now } },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  if (!result) throw new Error("That course no longer exists");
  return toAdminCourse(result);
}

export async function setCourseStatus(slug: string, status: CourseStatus): Promise<AdminCourse> {
  const collection = await courseCollection();
  const result = await collection.findOneAndUpdate(
    { slug },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!result) throw new Error("That course no longer exists");
  return toAdminCourse(result);
}

/** Persists a new rail order from an array of slugs, top to bottom. */
export async function reorderCourses(slugs: string[]): Promise<void> {
  const collection = await courseCollection();
  const now = new Date();

  await Promise.all(
    slugs.map((slug, index) =>
      collection.updateOne({ slug }, { $set: { order: asInt(index), updatedAt: now } }),
    ),
  );
}

/** The real delete. The UI archives by default; this has no undo. */
export async function deleteCourse(slug: string): Promise<boolean> {
  const collection = await courseCollection();
  const result = await collection.deleteOne({ slug });
  return result.deletedCount === 1;
}
