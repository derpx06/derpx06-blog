import fs from "node:fs";
import path from "node:path";
import type { ContentRecord, ContentSection, Course } from "@/types/content.types";

/**
 * A committed copy of everything in Mongo, written by `npm run content:snapshot`.
 *
 * The site has no on-disk content, so an unreachable cluster during `next build`
 * used to be a hard build failure — correct, in that it beats deploying an empty
 * site, but it also means a network blip between Vercel and Atlas blocks a
 * deploy that has nothing to do with content. This is the middle ground: build
 * from the snapshot, shout about it, and keep the failure for the case where
 * there is genuinely nothing to serve.
 *
 * Only ever read during a build. At runtime the repositories degrade quietly on
 * their own, and serving month-old content from a bundled file would be worse
 * than serving nothing.
 */

export const SNAPSHOT_FILE = "content-snapshot.json";

export type ContentSnapshot = {
  generatedAt: string;
  content: ContentRecord[];
  courses: Course[];
};

let cached: ContentSnapshot | null | undefined;

export function readSnapshot(): ContentSnapshot | null {
  if (cached !== undefined) return cached;

  try {
    const file = path.join(process.cwd(), SNAPSHOT_FILE);
    const parsed = JSON.parse(fs.readFileSync(file, "utf-8")) as ContentSnapshot;
    cached = Array.isArray(parsed?.content) && Array.isArray(parsed?.courses) ? parsed : null;
  } catch {
    cached = null;
  }

  return cached;
}

export function snapshotContent(section: ContentSection): ContentRecord[] {
  const snapshot = readSnapshot();
  if (!snapshot) return [];
  return snapshot.content.filter(
    (record) => record.section === section && record.status === "published",
  );
}

export function snapshotCourses(): Course[] {
  return readSnapshot()?.courses ?? [];
}
