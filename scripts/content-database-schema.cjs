const CONTENT_COLLECTION_NAME = "content";

const CONTENT_INDEXES = [
  {
    name: "content_section_slug_unique",
    key: { section: 1, slug: 1 },
    options: { unique: true },
  },
  {
    name: "content_section_publication_order",
    key: { section: 1, publishedAt: -1, updatedAt: -1 },
    options: {},
  },
  {
    name: "content_section_status_publication_order",
    key: { section: 1, status: 1, publishedAt: -1, updatedAt: -1 },
    options: {},
  },
  {
    name: "content_published_routes",
    key: { section: 1, publishedAt: -1, slug: 1 },
    options: {
      partialFilterExpression: { status: "published" },
    },
  },
];

const CONTENT_VALIDATOR = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "section",
      "slug",
      "title",
      "summary",
      "body",
      "bodyFormat",
      "status",
      "publishedAt",
      "createdAt",
      "updatedAt",
      "image",
      "images",
      "topics",
      "team",
      "source",
    ],
    properties: {
      section: {
        bsonType: "string",
        enum: ["blog", "learn", "explainers", "work"],
      },
      slug: { bsonType: "string" },
      title: { bsonType: "string" },
      summary: { bsonType: "string" },
      body: { bsonType: "string" },
      bodyFormat: { bsonType: "string", enum: ["mdx", "html"] },
      status: { bsonType: "string", enum: ["draft", "published", "archived"] },
      publishedAt: { bsonType: ["date", "null"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      image: { bsonType: "string" },
      images: {
        bsonType: "array",
        items: { bsonType: "string" },
      },
      tag: { bsonType: "string" },
      topics: {
        bsonType: "array",
        items: { bsonType: "string" },
      },
      team: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["name", "role", "avatar", "linkedIn"],
          properties: {
            name: { bsonType: "string" },
            role: { bsonType: "string" },
            avatar: { bsonType: "string" },
            linkedIn: { bsonType: "string" },
          },
        },
      },
      link: { bsonType: "string" },
      source: {
        bsonType: "object",
        required: ["type"],
        properties: {
          type: { bsonType: "string", enum: ["mongodb", "mdx"] },
          path: { bsonType: "string" },
        },
      },
    },
  },
};

const LEGACY_INDEX_NAMES = [
  "content_publication_order",
  "content_status_publication",
  "content_section_status_updated",
];

function getContentDatabasePlan({ collectionExists, existingIndexNames = [] }) {
  const existing = new Set(existingIndexNames);

  return {
    createCollection: !collectionExists,
    updateValidator: true,
    dropIndexes: LEGACY_INDEX_NAMES.filter((name) => existing.has(name)),
    createIndexes: CONTENT_INDEXES
      .filter((index) => !existing.has(index.name))
      .map((index) => index.name),
  };
}

async function ensureContentDatabase(db, options = {}) {
  const { dryRun = false, logger = console } = options;
  const collectionName = options.collectionName || CONTENT_COLLECTION_NAME;
  const collectionExists = await db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();
  const collection = collectionExists ? db.collection(collectionName) : null;
  const existingIndexes = collection ? await collection.listIndexes().toArray() : [];
  const plan = getContentDatabasePlan({
    collectionExists,
    existingIndexNames: existingIndexes.map((index) => index.name),
  });

  if (dryRun) return plan;

  if (!collectionExists) {
    await db.createCollection(collectionName, {
      validator: CONTENT_VALIDATOR,
      validationLevel: "strict",
      validationAction: "error",
    });
  } else {
    await db.command({
      collMod: collectionName,
      validator: CONTENT_VALIDATOR,
      validationLevel: "strict",
      validationAction: "error",
    });
  }

  const writableCollection = db.collection(collectionName);

  for (const indexName of plan.dropIndexes) {
    logger.log(`Dropping obsolete index ${indexName}`);
    await writableCollection.dropIndex(indexName);
  }

  for (const index of CONTENT_INDEXES) {
    if (!plan.createIndexes.includes(index.name)) continue;

    logger.log(`Creating index ${index.name}`);
    await writableCollection.createIndex(index.key, {
      ...index.options,
      name: index.name,
    });
  }

  return plan;
}

module.exports = {
  CONTENT_COLLECTION_NAME,
  CONTENT_INDEXES,
  CONTENT_VALIDATOR,
  getContentDatabasePlan,
  ensureContentDatabase,
};
