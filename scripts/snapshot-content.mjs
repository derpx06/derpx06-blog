/**
 * Writes content-snapshot.json — the build's fallback when Atlas is
 * unreachable. Commit the result.
 *
 * Usage:
 *   node scripts/snapshot-content.mjs          write ./content-snapshot.json
 *   node scripts/snapshot-content.mjs --check   exit 1 if the file is missing
 *                                               or older than 30 days
 *
 * Read-only against Mongo. See src/lib/build-guard.ts for how it is consumed.
 */

import { writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { MongoClient } from "mongodb";

const OUTPUT = path.resolve("content-snapshot.json");
const STALE_AFTER_DAYS = 30;

try {
  process.loadEnvFile(".env.local");
} catch {
  // Not fatal: the URI may come from the real environment instead.
}

function normalizeDate(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function asArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Mirrors toRecord() in src/lib/content-repository.ts. */
function toRecord(document) {
  return {
    section: document.section,
    slug: document.slug,
    metadata: {
      title: document.title || "",
      publishedAt: normalizeDate(document.publishedAt || document.createdAt),
      summary: document.summary || "",
      image: document.image || "",
      images: asArray(document.images),
      tag: Array.isArray(document.tag) ? document.tag[0] || "" : document.tag || "",
      topics: asArray(document.topics),
      team: asArray(document.team),
      link: document.link || "",
    },
    content: document.body || "",
    bodyFormat: document.bodyFormat === "html" ? "html" : "mdx",
    status: document.status || (document.published ? "published" : "draft"),
    updatedAt: normalizeDate(document.updatedAt || document.publishedAt || document.createdAt),
    source: { type: "mongodb" },
  };
}

function checkOnly() {
  if (!existsSync(OUTPUT)) {
    console.error(`✖ ${path.basename(OUTPUT)} is missing. Run: npm run content:snapshot`);
    return 1;
  }

  try {
    const { generatedAt, content } = JSON.parse(readFileSync(OUTPUT, "utf-8"));
    const ageDays = (Date.now() - new Date(generatedAt).getTime()) / 86_400_000;

    if (!Number.isFinite(ageDays)) {
      console.error("✖ Snapshot has no usable generatedAt.");
      return 1;
    }
    if (ageDays > STALE_AFTER_DAYS) {
      console.error(
        `✖ Snapshot is ${Math.round(ageDays)} days old (limit ${STALE_AFTER_DAYS}). Refresh it.`,
      );
      return 1;
    }

    console.log(`✓ Snapshot is ${Math.round(ageDays)} days old with ${content.length} documents.`);
    return 0;
  } catch (error) {
    console.error("✖ Snapshot is not readable:", error.message);
    return 1;
  }
}

async function main() {
  if (process.argv.includes("--check")) {
    process.exit(checkOnly());
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set (checked the environment and .env.local).");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "derpx06");

    const [documents, courses] = await Promise.all([
      db
        .collection(process.env.MONGODB_CONTENT_COLLECTION || "content")
        .find({ status: "published" }, { projection: { _id: 0 } })
        .sort({ publishedAt: -1 })
        .toArray(),
      db
        .collection(process.env.MONGODB_COURSE_COLLECTION || "courses")
        .find({ status: "published" }, { projection: { _id: 0 } })
        .sort({ order: 1, slug: 1 })
        .toArray(),
    ]);

    if (documents.length === 0) {
      console.error("✖ Refusing to write an empty snapshot — the query returned no documents.");
      process.exit(1);
    }

    const snapshot = {
      generatedAt: new Date().toISOString(),
      content: documents.map(toRecord),
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        slug: course.slug,
        image: course.image,
        topics: course.topics ?? [],
      })),
    };

    await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf-8");

    console.log(
      `Wrote ${path.basename(OUTPUT)} — ${snapshot.content.length} documents, ` +
        `${snapshot.courses.length} courses. Commit it.`,
    );
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
