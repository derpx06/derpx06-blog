import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth/session";
import { EMPTY_STATE, type ProgressEntry, type ReaderState, type SavedEntry } from "./reader-selectors";

export {
  activeCourse,
  EMPTY_STATE,
  resumePoint,
  savedList,
  type CourseEntry,
  type ProgressEntry,
  type ReaderState,
  type SavedEntry,
} from "./reader-selectors";

const COLLECTION = "reader_state";

async function states() {
  const { db } = await connectToDatabase();
  return db.collection<ReaderState & { userId: string }>(COLLECTION);
}

/** Reader state for the signed-in user, or empty state. Never throws. */
export const getReaderState = cache(async (): Promise<ReaderState> => {
  try {
    const user = await getCurrentUser();
    if (!user) return EMPTY_STATE;

    const collection = await states();
    const document = await collection.findOne({ userId: user.id });
    if (!document) return EMPTY_STATE;

    return {
      progress: document.progress ?? {},
      saved: document.saved ?? [],
      lessons: document.lessons ?? {},
    };
  } catch (error) {
    console.error("Reader state lookup failed:", error);
    return EMPTY_STATE;
  }
});

/* ------------------------------------------------------------------ writes */

export async function writeProgress(userId: string, entry: Omit<ProgressEntry, "updatedAt">) {
  const collection = await states();
  const document = await collection.findOne({ userId });
  // A re-read must never walk the bar backwards.
  const previous = document?.progress?.[entry.slug]?.percent ?? 0;
  const percent = Math.min(100, Math.max(0, Math.max(entry.percent, previous)));

  await collection.updateOne(
    { userId },
    { $set: { [`progress.${entry.slug}`]: { ...entry, percent, updatedAt: Date.now() } } },
    { upsert: true },
  );
}

export async function writeSaved(
  userId: string,
  piece: Omit<SavedEntry, "savedAt">,
  saved: boolean,
) {
  const collection = await states();
  if (saved) {
    // Remove first so a re-save refreshes savedAt instead of duplicating.
    await collection.updateOne(
      { userId },
      { $pull: { saved: { slug: piece.slug } } },
      { upsert: true },
    );
    await collection.updateOne(
      { userId },
      { $push: { saved: { ...piece, savedAt: Date.now() } } },
      { upsert: true },
    );
    return;
  }
  await collection.updateOne({ userId }, { $pull: { saved: { slug: piece.slug } } });
}

export async function writeLesson(userId: string, courseSlug: string, lessonSlug: string) {
  const collection = await states();
  await collection.updateOne(
    { userId },
    {
      $addToSet: { [`lessons.${courseSlug}.done`]: lessonSlug },
      $set: {
        [`lessons.${courseSlug}.last`]: lessonSlug,
        [`lessons.${courseSlug}.updatedAt`]: Date.now(),
      },
    },
    { upsert: true },
  );
}
