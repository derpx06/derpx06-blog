/**
 * The reverse of export-content.mjs: MDX files with frontmatter → MongoDB.
 *
 * The editor can only write blog posts as HTML and saveContent() always stamps
 * publishedAt with `now`, so neither can author a batch of dated explainers.
 * This can. Files round-trip with `npm run content:export`, which keeps the
 * drafts directory the editable source of truth.
 *
 *   node scripts/import-content.mjs [dir]           dry run (default)
 *   node scripts/import-content.mjs [dir] --write   commit
 *
 * Documents are written to satisfy the strict validator in
 * content-database-schema.cjs: every required field present, dates as real
 * BSON Dates, `tag` a string, upserted on the {section, slug} unique index.
 */
import { readdir, readFile } from "node:fs/promises";
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

/**
 * Frontmatter is written by export-content.mjs and by hand, in one fixed shape:
 * `key: "scalar"` or `key: ["a", "b"]`. That is small enough to parse here
 * rather than take a YAML dependency for it.
 */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw.trim() };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/.exec(line.trim());
    if (!field) continue;

    const [, key, value] = field;
    if (value.startsWith("[")) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        throw new Error(`${key}: not valid JSON array syntax — ${value}`);
      }
    } else if (value.startsWith('"')) {
      data[key] = JSON.parse(value);
    } else {
      data[key] = value;
    }
  }

  return { data, body: raw.slice(match[0].length).trim() };
}

/** Every required field, correctly typed, or the validator rejects the write. */
export function toDocument({ section, slug, data, body, existing, now }) {
  if (!data.title) throw new Error("title is required");

  const status = data.status || "published";
  if (!["draft", "published", "archived"].includes(status)) {
    throw new Error(`status must be draft|published|archived, got "${status}"`);
  }

  let publishedAt = null;
  if (data.publishedAt) {
    publishedAt = new Date(data.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) {
      throw new Error(`publishedAt is not a date — ${data.publishedAt}`);
    }
  } else if (status === "published") {
    publishedAt = existing?.publishedAt ?? now;
  }

  return {
    section,
    slug,
    title: data.title,
    summary: data.summary || "",
    body,
    bodyFormat: data.bodyFormat === "html" ? "html" : "mdx",
    status,
    publishedAt,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    image: data.image || "",
    images: existing?.images ?? [],
    tag: data.tag || "",
    topics: data.topics ?? existing?.topics ?? [],
    team: existing?.team ?? [],
    source: { type: "mongodb" },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const dir = path.resolve(args.find((arg) => !arg.startsWith("--")) || "content-drafts");

  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set — nothing to import.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const content = client
      .db(process.env.MONGODB_DB || "derpx06")
      .collection(process.env.MONGODB_CONTENT_COLLECTION || "content");

    const now = new Date();
    let imported = 0;
    let failed = 0;

    for (const section of SECTIONS) {
      let files;
      try {
        files = (await readdir(path.join(dir, section))).filter((file) => file.endsWith(".mdx"));
      } catch {
        continue;
      }

      for (const file of files.sort()) {
        const slug = file.replace(/\.mdx$/, "");
        try {
          const raw = await readFile(path.join(dir, section, file), "utf8");
          const { data, body } = parseFrontmatter(raw);
          if (!body) throw new Error("body is empty");

          const existing = await content.findOne({ section, slug });
          const document = toDocument({ section, slug, data, body, existing, now });

          if (write) {
            await content.updateOne({ section, slug }, { $set: document }, { upsert: true });
          }

          const date = document.publishedAt?.toISOString().slice(0, 10) ?? "unpublished";
          const verb = existing ? "update" : "create";
          console.log(
            `${write ? "ok  " : "plan"} ${section.padEnd(10)} ${slug.padEnd(46)} ${date}  ${verb}`,
          );
          imported += 1;
        } catch (error) {
          console.error(`FAIL ${section.padEnd(10)} ${slug.padEnd(46)} ${error.message}`);
          failed += 1;
        }
      }
    }

    console.log(
      `\n${imported} document(s) ${write ? "written" : "would be written"}` +
        `${failed ? `, ${failed} failed` : ""}` +
        `${write ? "" : "  —  re-run with --write to commit"}`,
    );
    if (failed) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
