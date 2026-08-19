const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { MongoClient } = require("mongodb");
const {
  contentKey,
  getSectionFromPath,
  toContentDocument,
} = require("./content-migration-utils.cjs");
const {
  ensureContentDatabase,
} = require("./content-database-schema.cjs");

const root = process.cwd();
const contentRoots = [
  path.join(root, "src", "app", "blog", "posts"),
  path.join(root, "src", "app", "blog", "drafts"),
  path.join(root, "src", "app", "learn", "posts"),
  path.join(root, "src", "app", "explainers", "posts"),
  path.join(root, "src", "app", "work", "projects"),
];

function findMdxFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findMdxFiles(filePath);
    return entry.name.endsWith(".mdx") ? [filePath] : [];
  });
}

function relativePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function assetReferences(metadata, body) {
  const refs = [metadata.image, ...(metadata.images || []), ...(metadata.team || []).map((member) => member.avatar)]
    .filter((value) => typeof value === "string" && value.startsWith("/"));

  for (const match of body.matchAll(/(?:src|file)=["']([^"']+)["']/g)) {
    if (match[1].startsWith("/")) refs.push(match[1]);
  }

  return [...new Set(refs)];
}

function inspectFiles() {
  const records = [];
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (const rootDirectory of contentRoots) {
    for (const filePath of findMdxFiles(rootDirectory)) {
      const sourcePath = relativePath(filePath);
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = matter(raw);
      const section = getSectionFromPath(sourcePath);
      const slug = path.basename(filePath, ".mdx");
      const key = contentKey({ section, slug });

      if (seen.has(key)) errors.push(`Duplicate content key: ${key}`);
      seen.add(key);

      try {
        const document = toContentDocument({
          section,
          slug,
          metadata: parsed.data,
          body: parsed.content,
          sourcePath,
        });
        records.push(document);

        for (const reference of assetReferences(parsed.data, parsed.content)) {
          const assetPath = path.join(root, "public", decodeURIComponent(reference));
          if (!fs.existsSync(assetPath)) {
            warnings.push(`${sourcePath}: missing public asset ${reference}`);
          }
        }
      } catch (error) {
        errors.push(`${sourcePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return { records, errors, warnings };
}

function printReport({ records, errors, warnings }) {
  const counts = records.reduce((result, record) => {
    result[record.section] = (result[record.section] || 0) + 1;
    return result;
  }, {});

  console.log(`MDX records: ${records.length}`);
  console.log(`By section: ${JSON.stringify(counts)}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  for (const message of errors) console.error(`ERROR: ${message}`);
  for (const message of warnings) console.warn(`WARNING: ${message}`);
}

async function writeRecords(records) {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB || "derpx06");
    const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";
    await ensureContentDatabase(db, { collectionName });
    const collection = db.collection(collectionName);

    for (const record of records) {
      const { createdAt, ...setFields } = record;
      await collection.updateOne(
        { section: record.section, slug: record.slug },
        {
          $set: setFields,
          $setOnInsert: { createdAt },
        },
        { upsert: true },
      );
    }

    console.log(`Imported ${records.length} records into ${collection.collectionName}`);
  } finally {
    await client.close();
  }
}

async function main() {
  const report = inspectFiles();
  printReport(report);

  if (report.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes("--write")) {
    await writeRecords(report.records);
  } else {
    console.log("Dry run only. Pass --write to import records.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
