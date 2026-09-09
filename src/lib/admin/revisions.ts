import { connectToDatabase } from "@/lib/mongodb";
import type { ContentBodyFormat, ContentRecord, ContentSection } from "@/types/content.types";

/**
 * Edit history for content documents.
 *
 * A revision is written *before* an edit lands, so the stored rows are the
 * states the document has already been in. That makes rollback a matter of
 * replaying one of them, and it means the newest revision is the version
 * immediately prior to what is live now.
 *
 * Capped per document — this is a safety net for "I just broke the intro", not
 * an archive, and article bodies are large enough that keeping every save
 * forever would dominate the database.
 */

const COLLECTION = "content_revisions";
const KEEP_PER_DOCUMENT = 30;

export type Revision = {
  id: string;
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  body: string;
  bodyFormat: ContentBodyFormat;
  savedAt: string;
  savedBy: string;
  words: number;
};

type RevisionDocument = {
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  body: string;
  bodyFormat: ContentBodyFormat;
  savedAt: Date;
  savedBy: string;
};

let indexesReady: Promise<void> | null = null;

async function revisions() {
  const { db } = await connectToDatabase();
  const collection = db.collection<RevisionDocument>(COLLECTION);
  // One index build per process, matching the pattern in lib/auth/session.ts.
  indexesReady ||= collection.createIndex({ section: 1, slug: 1, savedAt: -1 }).then(() => {});
  await indexesReady;
  return collection;
}

function toRevision(document: RevisionDocument & { _id?: unknown }): Revision {
  return {
    id: String(document._id ?? ""),
    section: document.section,
    slug: document.slug,
    title: document.title,
    summary: document.summary,
    body: document.body,
    bodyFormat: document.bodyFormat,
    savedAt: document.savedAt.toISOString(),
    savedBy: document.savedBy,
    words: (document.body || "").split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Records the current state of a document. Never throws: losing a revision is
 * worth a log line, not a failed save — the edit itself is the thing that
 * matters to the person clicking the button.
 */
export async function saveRevision(record: ContentRecord, savedBy: string): Promise<void> {
  try {
    const collection = await revisions();

    await collection.insertOne({
      section: record.section,
      slug: record.slug,
      title: record.metadata.title,
      summary: record.metadata.summary,
      body: record.content,
      bodyFormat: record.bodyFormat,
      savedAt: new Date(),
      savedBy,
    });

    // Trim to the cap. Collect the ids to drop rather than deleting by date, so
    // two saves in the same millisecond cannot remove each other's row.
    const stale = await collection
      .find({ section: record.section, slug: record.slug }, { projection: { _id: 1 } })
      .sort({ savedAt: -1 })
      .skip(KEEP_PER_DOCUMENT)
      .toArray();

    if (stale.length > 0) {
      await collection.deleteMany({ _id: { $in: stale.map((row) => row._id) } });
    }
  } catch (error) {
    console.error(`Saving a revision of ${record.section}/${record.slug} failed:`, error);
  }
}

export async function listRevisions(section: ContentSection, slug: string): Promise<Revision[]> {
  try {
    const collection = await revisions();
    const documents = await collection
      .find({ section, slug })
      .sort({ savedAt: -1 })
      .limit(KEEP_PER_DOCUMENT)
      .toArray();
    return documents.map(toRevision);
  } catch (error) {
    console.error(`Listing revisions of ${section}/${slug} failed:`, error);
    return [];
  }
}

export async function getRevision(id: string): Promise<Revision | null> {
  try {
    const { ObjectId } = await import("mongodb");
    if (!ObjectId.isValid(id)) return null;

    const collection = await revisions();
    const document = await collection.findOne({ _id: new ObjectId(id) });
    return document ? toRevision(document) : null;
  } catch (error) {
    console.error(`Reading revision ${id} failed:`, error);
    return null;
  }
}

/** Removes a document's history — called when the document itself is purged. */
export async function dropRevisions(section: ContentSection, slug: string): Promise<void> {
  try {
    const collection = await revisions();
    await collection.deleteMany({ section, slug });
  } catch (error) {
    console.error(`Dropping revisions of ${section}/${slug} failed:`, error);
  }
}
