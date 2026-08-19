import assert from "node:assert/strict";
import test from "node:test";

import { extractHeadings } from "@/lib/headings";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import {
  activeCourse,
  courseStanding,
  resumePoint,
  savedList,
  type ReaderState,
} from "@/lib/reader-selectors";
import {
  groupByYear,
  readingMinutes,
  relatedTo,
  tagCounts,
  toPiece,
  type Piece,
} from "@/lib/pieces";

const piece = (over: Partial<Piece>): Piece => ({
  slug: "s",
  href: "/blog/s",
  title: "T",
  summary: "",
  tag: "Systems",
  image: "",
  publishedAt: "2026-01-01",
  minutes: 5,
  year: 2026,
  ...over,
});

test("readingMinutes ignores code fences and markup", () => {
  const prose = "word ".repeat(440);
  assert.equal(readingMinutes(prose), 2);
  assert.equal(readingMinutes(`${prose}\n\`\`\`\n${"code ".repeat(4000)}\n\`\`\``), 2);
  assert.equal(readingMinutes(""), 1, "an empty body still reads as one minute, never zero");
});

test("toPiece falls back through tag, topics, then a default", () => {
  const base = {
    section: "blog" as const,
    slug: "a",
    content: "",
    status: "published" as const,
    source: { type: "mdx" as const },
  };
  const withTag = toPiece({
    ...base,
    metadata: { title: "A", summary: "", publishedAt: "2026-02-03", image: "", images: [], tag: "Rust", topics: ["X"], team: [], link: "" },
  });
  assert.equal(withTag.tag, "Rust");
  assert.equal(withTag.year, 2026);

  const withTopic = toPiece({
    ...base,
    metadata: { title: "A", summary: "", publishedAt: "", image: "", images: [], tag: "", topics: ["Queues"], team: [], link: "" },
  });
  assert.equal(withTopic.tag, "Queues");
  assert.equal(withTopic.year, 0, "an unparseable date must not crash the year grouping");
});

test("tagCounts sorts by count then name", () => {
  const counts = tagCounts([
    piece({ slug: "1", tag: "Rust" }),
    piece({ slug: "2", tag: "Systems" }),
    piece({ slug: "3", tag: "Systems" }),
  ]);
  assert.deepEqual(counts, [
    { tag: "Systems", count: 2 },
    { tag: "Rust", count: 1 },
  ]);
});

test("groupByYear buckets newest year first", () => {
  const groups = groupByYear([
    piece({ slug: "1", year: 2025 }),
    piece({ slug: "2", year: 2026 }),
    piece({ slug: "3", year: 2025 }),
  ]);
  assert.deepEqual(groups.map((g) => [g.year, g.pieces.length]), [[2026, 1], [2025, 2]]);
});

test("relatedTo prefers the same tag and never returns the piece itself", () => {
  const current = piece({ slug: "current", tag: "Systems" });
  const related = relatedTo(current, [
    current,
    piece({ slug: "other-tag", tag: "Rust" }),
    piece({ slug: "same-tag", tag: "Systems" }),
  ]);
  assert.deepEqual(related.map((r) => r.slug), ["same-tag", "other-tag"]);
});

test("extractHeadings reads h2/h3 and skips fenced code", () => {
  const body = [
    "# Title",
    "## The shape of the problem",
    "```",
    "## not a heading",
    "```",
    "### Where chunking lies to you",
    "text",
  ].join("\n");

  assert.deepEqual(extractHeadings(body), [
    { id: "the-shape-of-the-problem", text: "The shape of the problem", level: 2 },
    { id: "where-chunking-lies-to-you", text: "Where chunking lies to you", level: 3 },
  ]);
});

test("passwords round-trip and reject the wrong one", async () => {
  const stored = await hashPassword("correct-horse-battery");
  assert.match(stored, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.equal(await verifyPassword("correct-horse-battery", stored), true);
  assert.equal(await verifyPassword("wrong", stored), false);
  assert.equal(await verifyPassword("x", "garbage"), false, "a malformed hash must not throw");
});

test("resumePoint picks the newest started-but-unfinished piece", () => {
  const state: ReaderState = {
    progress: {
      finished: { slug: "finished", href: "/a", title: "A", minutes: 5, percent: 99, updatedAt: 300 },
      barely: { slug: "barely", href: "/b", title: "B", minutes: 5, percent: 1, updatedAt: 200 },
      old: { slug: "old", href: "/c", title: "C", minutes: 5, percent: 50, updatedAt: 100 },
      recent: { slug: "recent", href: "/d", title: "D", minutes: 5, percent: 40, updatedAt: 250 },
    },
    saved: [],
    lessons: {},
  };
  assert.equal(resumePoint(state)?.slug, "recent");
  assert.equal(resumePoint({ progress: {}, saved: [], lessons: {} }), null);
});

test("savedList is newest-first and activeCourse is most recently touched", () => {
  const state: ReaderState = {
    progress: {},
    saved: [
      { slug: "old", href: "/a", title: "A", minutes: 1, savedAt: 10 },
      { slug: "new", href: "/b", title: "B", minutes: 1, savedAt: 20 },
    ],
    lessons: {
      stale: { done: ["x"], last: "x", updatedAt: 5 },
      fresh: { done: ["y"], last: "y", updatedAt: 50 },
    },
  };
  assert.deepEqual(savedList(state).map((s) => s.slug), ["new", "old"]);
  assert.equal(activeCourse(state)?.slug, "fresh");
  assert.equal(activeCourse({ progress: {}, saved: [], lessons: {} }), null);
});

test("courseStanding tracks position, progress and the next lesson", () => {
  const lessons = [{ slug: "a" }, { slug: "b" }, { slug: "c" }, { slug: "d" }];

  const fresh = courseStanding(lessons, []);
  assert.equal(fresh.next?.slug, "a");
  assert.equal(fresh.number, 1);
  assert.equal(fresh.started, false);
  assert.equal(fresh.percent, 0);

  const partway = courseStanding(lessons, ["a", "b"]);
  assert.equal(partway.next?.slug, "c");
  assert.equal(partway.number, 3);
  assert.equal(partway.started, true);
  assert.equal(partway.percent, 50);

  // Out-of-order completion still resumes at the first gap.
  assert.equal(courseStanding(lessons, ["a", "c"]).next?.slug, "b");

  // Finished: nothing left, so it points back at the first lesson.
  const done = courseStanding(lessons, ["a", "b", "c", "d"]);
  assert.equal(done.percent, 100);
  assert.equal(done.next?.slug, "a");

  assert.equal(courseStanding([], []).percent, 0, "an empty course must not divide by zero");
});
