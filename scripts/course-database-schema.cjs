const COURSE_COLLECTION_NAME = "courses";

const COURSE_INDEXES = [
  {
    name: "course_slug_unique",
    key: { slug: 1 },
    options: { unique: true },
  },
  {
    name: "course_publication_order",
    key: { status: 1, order: 1 },
    options: {},
  },
];

const COURSE_VALIDATOR = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "id",
      "title",
      "description",
      "slug",
      "image",
      "topics",
      "status",
      "order",
      "createdAt",
      "updatedAt",
      "source",
    ],
    properties: {
      id: { bsonType: "string" },
      title: { bsonType: "string" },
      description: { bsonType: "string" },
      slug: { bsonType: "string" },
      image: { bsonType: "string" },
      topics: {
        bsonType: "array",
        items: {
          bsonType: "object",
          required: ["title", "links"],
          properties: {
            title: { bsonType: "string" },
            links: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["title", "slug", "postSlugs"],
                properties: {
                  title: { bsonType: "string" },
                  slug: { bsonType: "string" },
                  postSlugs: {
                    bsonType: "array",
                    items: { bsonType: "string" },
                  },
                },
              },
            },
          },
        },
      },
      status: { bsonType: "string", enum: ["draft", "published", "archived"] },
      order: { bsonType: "int" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      source: {
        bsonType: "object",
        required: ["type"],
        properties: {
          type: { bsonType: "string", enum: ["local", "mongodb"] },
          path: { bsonType: "string" },
        },
      },
    },
  },
};

async function ensureCourseDatabase(db, options = {}) {
  const { dryRun = false, logger = console } = options;
  const collectionName = options.collectionName || COURSE_COLLECTION_NAME;
  const collectionExists = await db.listCollections({ name: collectionName }, { nameOnly: true }).hasNext();
  const existingCollection = collectionExists ? db.collection(collectionName) : null;
  const existingIndexes = existingCollection ? await existingCollection.listIndexes().toArray() : [];
  const existingNames = new Set(existingIndexes.map((index) => index.name));
  const plan = {
    createCollection: !collectionExists,
    updateValidator: true,
    createIndexes: COURSE_INDEXES.filter((index) => !existingNames.has(index.name)).map((index) => index.name),
  };

  if (dryRun) return plan;

  if (!collectionExists) {
    await db.createCollection(collectionName, {
      validator: COURSE_VALIDATOR,
      validationLevel: "strict",
      validationAction: "error",
    });
  } else {
    await db.command({
      collMod: collectionName,
      validator: COURSE_VALIDATOR,
      validationLevel: "strict",
      validationAction: "error",
    });
  }

  const collection = db.collection(collectionName);
  for (const index of COURSE_INDEXES) {
    if (!plan.createIndexes.includes(index.name)) continue;
    logger.log(`Creating index ${index.name}`);
    await collection.createIndex(index.key, { ...index.options, name: index.name });
  }

  return plan;
}

module.exports = {
  COURSE_COLLECTION_NAME,
  COURSE_INDEXES,
  COURSE_VALIDATOR,
  ensureCourseDatabase,
};
