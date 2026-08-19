/**
 * Content now lives only in MongoDB. This writes it back out as MDX with
 * frontmatter, so there is always a second copy that survives losing the
 * cluster. Run it before migrations, or on a schedule.
 *
 *   node scripts/export-content.mjs [outDir]     (default: content-backup/)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";

const SECTIONS = ["blog", "explainers", "learn", "work"];

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
      return;
    } catch {
      /* try the next one */
    }
  }
}

/** Quote-safe YAML scalar. */
function yaml(value) {
  return `"${String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function frontmatter(document) {
  const date = document.publishedAt ? new Date(document.publishedAt).toISOString() : "";
  return [
    "---",
    `title: ${yaml(document.title)}`,
    `summary: ${yaml(document.summary)}`,
    `publishedAt: ${yaml(date)}`,
    `image: ${yaml(document.image)}`,
    `tag: ${yaml(Array.isArray(document.tag) ? document.tag[0] : document.tag)}`,
    `status: ${yaml(document.status)}`,
    "---",
    "",
    "",
  ].join("\n");
}

const outDir = path.resolve(process.argv[2] || "content-backup");
loadEnv();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set — nothing to export.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(process.env.MONGODB_DB || "derpx06");
  const content = db.collection(process.env.MONGODB_CONTENT_COLLECTION || "content");
  let total = 0;

  for (const section of SECTIONS) {
    const documents = await content.find({ section }).toArray();
    if (documents.length === 0) continue;

    const dir = path.join(outDir, section);
    await mkdir(dir, { recursive: true });

    for (const document of documents) {
      await writeFile(
        path.join(dir, `${document.slug}.mdx`),
        frontmatter(document) + (document.body || ""),
        "utf8",
      );
    }

    console.log(`${section.padEnd(12)} ${documents.length} files`);
    total += documents.length;
  }

  // Courses are structure, not prose — JSON keeps them exact.
  const courses = await db
    .collection(process.env.MONGODB_COURSE_COLLECTION || "courses")
    .find({}, { projection: { _id: 0 } })
    .toArray();

  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "courses.json"), JSON.stringify(courses, null, 2), "utf8");
  console.log(`${"courses".padEnd(12)} ${courses.length} entries`);

  console.log(`\n${total} documents + ${courses.length} courses → ${outDir}`);
} finally {
  await client.close();
}
