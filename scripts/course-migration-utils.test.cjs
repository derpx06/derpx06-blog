const test = require("node:test");
const assert = require("node:assert/strict");

const {
  courseKey,
  normalizeCourse,
} = require("./course-migration-utils.cjs");
const { COURSE_INDEXES, COURSE_VALIDATOR } = require("./course-database-schema.cjs");

test("normalizes a course while preserving lesson order and links", () => {
  const course = normalizeCourse({
    course: {
      id: "langchain-mastery",
      title: "LangChain Mastery",
      description: "Build LLM applications.",
      slug: "langchain-mastery",
      image: "/images/course.png",
      topics: [
        {
          title: "1. Foundations",
          links: [
            { title: "Intro", slug: "langchain-intro", postSlugs: ["langchain-intro"] },
          ],
        },
      ],
    },
    order: 1,
    sourcePath: "src/resources/courses.ts",
    now: new Date("2026-08-12T00:00:00.000Z"),
  });

  assert.equal(courseKey(course), "langchain-mastery");
  assert.equal(course.status, "published");
  assert.equal(course.order, 1);
  assert.deepEqual(course.topics[0].links[0].postSlugs, ["langchain-intro"]);
  assert.equal(course.source.type, "local");
  assert.equal(course.createdAt.toISOString(), "2026-08-12T00:00:00.000Z");
});

test("rejects a course without a stable slug", () => {
  assert.throws(
    () => normalizeCourse({ course: { title: "Missing slug" }, order: 0 }),
    /Course id and slug are required/,
  );
});

test("defines stable course identity and publication ordering indexes", () => {
  assert.deepEqual(COURSE_INDEXES.map((index) => index.name), [
    "course_slug_unique",
    "course_publication_order",
  ]);
  assert.deepEqual(COURSE_INDEXES[0].key, { slug: 1 });
  assert.equal(COURSE_INDEXES[0].options.unique, true);
  assert.deepEqual(COURSE_INDEXES[1].key, { status: 1, order: 1 });
  assert.equal(COURSE_VALIDATOR.$jsonSchema.properties.status.enum.includes("published"), true);
});
