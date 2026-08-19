const test = require("node:test");
const assert = require("node:assert/strict");

const {
  contentKey,
  getSectionFromPath,
  normalizeMetadata,
  toContentDocument,
} = require("./content-migration-utils.cjs");
const {
  CONTENT_INDEXES,
  CONTENT_VALIDATOR,
  getContentDatabasePlan,
} = require("./content-database-schema.cjs");

test("maps each content directory to its MongoDB section", () => {
  assert.equal(getSectionFromPath("src/app/blog/posts/example.mdx"), "blog");
  assert.equal(getSectionFromPath("src/app/learn/posts/langchain/example.mdx"), "learn");
  assert.equal(getSectionFromPath("src/app/explainers/posts/example.mdx"), "explainers");
  assert.equal(getSectionFromPath("src/app/work/projects/example.mdx"), "work");
});

test("rejects a content file outside a supported section", () => {
  assert.throws(() => getSectionFromPath("src/app/about/page.tsx"), /Unsupported content path/);
});

test("normalizes legacy frontmatter defaults without changing article values", () => {
  const metadata = normalizeMetadata({
    title: "Example",
    publishedAt: "2026-01-23",
    summary: "Summary",
    image: "/images/example.png",
    tag: ["AI"],
    topics: "Agents",
    images: "/images/example-2.png",
    team: { name: "Author" },
  });

  assert.deepEqual(metadata, {
    title: "Example",
    publishedAt: "2026-01-23",
    summary: "Summary",
    image: "/images/example.png",
    images: ["/images/example-2.png"],
    tag: "AI",
    topics: ["Agents"],
    team: [{ name: "Author" }],
    link: "",
  });
});

test("creates a section-scoped document with safe publication dates", () => {
  const document = toContentDocument({
    section: "blog",
    slug: "example",
    metadata: { title: "Example", publishedAt: "2026-01-23" },
    body: "# Example",
    sourcePath: "src/app/blog/posts/example.mdx",
  });

  assert.equal(contentKey(document), "blog:example");
  assert.equal(document.status, "published");
  assert.equal(document.bodyFormat, "mdx");
  assert.equal(document.publishedAt.toISOString(), "2026-01-23T00:00:00.000Z");
  assert.equal(document.source.type, "mdx");
  assert.equal(document.source.path, "src/app/blog/posts/example.mdx");
});

test("defines section-scoped indexes for the content query patterns", () => {
  assert.deepEqual(CONTENT_INDEXES.map((index) => index.name), [
    "content_section_slug_unique",
    "content_section_publication_order",
    "content_section_status_publication_order",
    "content_published_routes",
  ]);

  assert.deepEqual(CONTENT_INDEXES[0].key, { section: 1, slug: 1 });
  assert.equal(CONTENT_INDEXES[0].options.unique, true);
  assert.deepEqual(CONTENT_INDEXES[1].key, {
    section: 1,
    publishedAt: -1,
    updatedAt: -1,
  });
  assert.deepEqual(CONTENT_INDEXES[2].key, {
    section: 1,
    status: 1,
    publishedAt: -1,
    updatedAt: -1,
  });
  assert.deepEqual(CONTENT_INDEXES[3].options.partialFilterExpression, {
    status: "published",
  });
});

test("requires the fields needed to safely render and publish content", () => {
  const required = CONTENT_VALIDATOR.$jsonSchema.required;

  for (const field of [
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
    "images",
    "topics",
    "team",
    "source",
  ]) {
    assert.equal(required.includes(field), true, `missing required field ${field}`);
  }

  assert.deepEqual(CONTENT_VALIDATOR.$jsonSchema.properties.section.enum, [
    "blog",
    "learn",
    "explainers",
    "work",
  ]);
  assert.deepEqual(CONTENT_VALIDATOR.$jsonSchema.properties.status.enum, [
    "draft",
    "published",
    "archived",
  ]);
});

test("reports safe database setup actions without mutating the database", () => {
  const plan = getContentDatabasePlan({
    collectionExists: true,
    existingIndexNames: [
      "_id_",
      "content_section_slug_unique",
      "content_publication_order",
      "content_status_publication",
      "content_section_status_updated",
    ],
  });

  assert.deepEqual(plan.dropIndexes, [
    "content_publication_order",
    "content_status_publication",
    "content_section_status_updated",
  ]);
  assert.deepEqual(plan.createIndexes, [
    "content_section_publication_order",
    "content_section_status_publication_order",
    "content_published_routes",
  ]);
  assert.equal(plan.updateValidator, true);
});
