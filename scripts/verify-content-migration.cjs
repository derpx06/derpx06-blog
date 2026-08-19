const fs = require("node:fs");
const path = require("node:path");
const matter = require("gray-matter");
const { MongoClient } = require("mongodb");
const { contentKey, getSectionFromPath, toContentDocument } = require("./content-migration-utils.cjs");
const { CONTENT_INDEXES } = require("./content-database-schema.cjs");

const projectRoot = process.cwd();
const roots = [
  path.join(projectRoot, "src", "app", "blog", "posts"),
  path.join(projectRoot, "src", "app", "blog", "drafts"),
  path.join(projectRoot, "src", "app", "learn", "posts"),
  path.join(projectRoot, "src", "app", "explainers", "posts"),
  path.join(projectRoot, "src", "app", "work", "projects"),
];

function findFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(filePath);
    return entry.name.endsWith(".mdx") ? [filePath] : [];
  });
}

function localRecords() {
  return roots.flatMap((directory) => findFiles(directory).map((filePath) => {
    const sourcePath = path.relative(projectRoot, filePath).split(path.sep).join("/");
    const parsed = matter(fs.readFileSync(filePath, "utf8"));
    return toContentDocument({
      section: getSectionFromPath(sourcePath),
      slug: path.basename(filePath, ".mdx"),
      metadata: parsed.data,
      body: parsed.content,
      sourcePath,
    });
  }));
}

function comparable(record) {
  return {
    section: record.section,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    body: record.body,
    status: record.status || (record.published ? "published" : "draft"),
    image: record.image || "",
    images: record.images || [],
    tag: Array.isArray(record.tag) ? record.tag[0] || "" : record.tag || "",
    topics: record.topics || [],
    team: record.team || [],
    link: record.link || "",
  };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const local = localRecords();
  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB || "derpx06");
    const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    const collectionInfo = await db.listCollections({ name: collectionName }, { nameOnly: false }).toArray();
    const indexes = await collection.listIndexes().toArray();
    const indexNames = new Set(indexes.map((index) => index.name));
    const expectedIndexNames = CONTENT_INDEXES.map((index) => index.name);
    const missingIndexes = expectedIndexNames.filter((name) => !indexNames.has(name));
    const validatorOptions = collectionInfo[0]?.options || {};
    const structureValid = missingIndexes.length === 0
      && Boolean(validatorOptions.validator)
      && validatorOptions.validationLevel === "strict"
      && validatorOptions.validationAction === "error";
    const localMap = new Map(local.map((record) => [contentKey(record), comparable(record)]));
    const databaseMap = new Map(documents.map((record) => [contentKey(record), comparable(record)]));
    const differences = [];

    for (const key of new Set([...localMap.keys(), ...databaseMap.keys()])) {
      const expected = localMap.get(key);
      const actual = databaseMap.get(key);
      if (!expected || !actual || JSON.stringify(expected) !== JSON.stringify(actual)) {
        differences.push({ key, expected: Boolean(expected), actual: Boolean(actual) });
      }
    }

    console.log(JSON.stringify({
      local: local.length,
      database: documents.length,
      differences: differences.length,
      databaseStructure: {
        validatorConfigured: Boolean(validatorOptions.validator),
        validationLevel: validatorOptions.validationLevel,
        validationAction: validatorOptions.validationAction,
        indexes: indexes.map((index) => index.name),
        missingIndexes,
        valid: structureValid,
      },
    }));
    for (const difference of differences) console.error(JSON.stringify(difference));
    if (!structureValid) {
      console.error("Database structure does not match the expected content schema/indexes");
      process.exitCode = 1;
    }
    if (differences.length > 0) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
