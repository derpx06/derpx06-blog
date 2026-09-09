import assert from "node:assert/strict";
import test from "node:test";

import { extractHeadings } from "@/lib/headings";
import {
  issuePageAccessToken,
  PAGE_ACCESS_MAX_AGE_SECONDS,
  verifyPageAccessToken,
} from "@/lib/auth/page-access";
import { parseSafeUrl } from "@/lib/safe-fetch";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { scalarTag, slugify, toDate } from "@/lib/admin/content-writes";
import {
  addLesson,
  addTopic,
  moveItem,
  moveLesson,
  removeLesson,
  removeTopic,
  validateCourseReferences,
} from "@/lib/admin/course-writes";
import type { CourseTopic } from "@/types/content.types";
import {
  issuePreviewToken,
  PREVIEW_TTL_SECONDS,
  verifyPreviewToken,
} from "@/lib/admin/preview-token";
import { checkCheckable, findDangerousMarkup } from "@/lib/admin/editorial-check";
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
    bodyFormat: "mdx" as const,
    status: "published" as const,
    source: { type: "mdx" as const },
  };
  const withTag = toPiece({
    ...base,
    metadata: {
      title: "A",
      summary: "",
      publishedAt: "2026-02-03",
      image: "",
      images: [],
      tag: "Rust",
      topics: ["X"],
      team: [],
      link: "",
    },
  });
  assert.equal(withTag.tag, "Rust");
  assert.equal(withTag.year, 2026);

  const withTopic = toPiece({
    ...base,
    metadata: {
      title: "A",
      summary: "",
      publishedAt: "",
      image: "",
      images: [],
      tag: "",
      topics: ["Queues"],
      team: [],
      link: "",
    },
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
  assert.deepEqual(
    groups.map((g) => [g.year, g.pieces.length]),
    [
      [2026, 1],
      [2025, 2],
    ],
  );
});

test("relatedTo prefers the same tag and never returns the piece itself", () => {
  const current = piece({ slug: "current", tag: "Systems" });
  const related = relatedTo(current, [
    current,
    piece({ slug: "other-tag", tag: "Rust" }),
    piece({ slug: "same-tag", tag: "Systems" }),
  ]);
  assert.deepEqual(
    related.map((r) => r.slug),
    ["same-tag", "other-tag"],
  );
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

test("extractHeadings ignores HTML headings — markdown only", () => {
  // The HTML fallback went with the TipTap editor; content:check fails a body
  // with no ## headings, so a JSX/HTML-only outline must stay empty here.
  assert.deepEqual(extractHeadings("<p>Intro.</p>\n<h2>Decorative</h2>"), []);
  assert.deepEqual(extractHeadings("## Real\n\n<h2>Decorative</h2>"), [
    { id: "real", text: "Real", level: 2 },
  ]);
});

test("parseSafeUrl rejects everything that is not a public https host", () => {
  assert.equal(parseSafeUrl("https://example.com/a").ok, true);
  assert.equal(parseSafeUrl("http://example.com").ok, false, "plain http");
  assert.equal(parseSafeUrl("file:///etc/passwd").ok, false, "file scheme");
  assert.equal(parseSafeUrl("https://169.254.169.254/latest/meta-data").ok, false, "metadata IP");
  assert.equal(parseSafeUrl("https://127.0.0.1/").ok, false, "loopback");
  assert.equal(parseSafeUrl("https://10.0.0.5/").ok, false, "private range");
  assert.equal(parseSafeUrl("https://192.168.1.1/").ok, false, "private range");
  assert.equal(parseSafeUrl("https://[::1]/").ok, false, "ipv6 loopback");
  assert.equal(parseSafeUrl("https://user:pw@example.com/").ok, false, "embedded credentials");
  assert.equal(parseSafeUrl("").ok, false, "empty");
  assert.equal(parseSafeUrl("not a url").ok, false, "unparseable");
});

test("page access tokens verify, expire, and reject tampering", () => {
  process.env.PAGE_ACCESS_SECRET = "test-secret";

  const now = Date.now();
  const token = issuePageAccessToken(now);
  assert.ok(token);
  assert.equal(verifyPageAccessToken(token, now + 1000), true);

  assert.equal(
    verifyPageAccessToken(token, now + PAGE_ACCESS_MAX_AGE_SECONDS * 1000 + 1),
    false,
    "an expired token is refused",
  );
  assert.equal(verifyPageAccessToken("authenticated", now), false, "the old literal is refused");
  assert.equal(verifyPageAccessToken(`${now + 10_000_000}.forged`, now), false, "a forged mac");
  assert.equal(verifyPageAccessToken(null, now), false);
});

/* ------------------------------------------------------------------- admin */

test("isAdminEmail reads the allowlist fresh and normalises both sides", () => {
  process.env.ADMIN_EMAILS = " Owner@Example.COM , second@example.com ";
  assert.equal(isAdminEmail("owner@example.com"), true);
  assert.equal(isAdminEmail("  OWNER@example.com "), true, "normalised");
  assert.equal(isAdminEmail("second@example.com"), true);
  assert.equal(isAdminEmail("someone@example.com"), false);
  assert.equal(isAdminEmail(""), false);
  assert.equal(isAdminEmail(null), false);

  process.env.ADMIN_EMAILS = "";
  assert.equal(isAdminEmail("owner@example.com"), false, "no allowlist means no admins");
});

test("scalarTag collapses the legacy array shape the validator rejects", () => {
  assert.equal(scalarTag("Systems"), "Systems");
  assert.equal(scalarTag(["Systems", "Other"]), "Systems");
  assert.equal(scalarTag([]), "");
  assert.equal(scalarTag(undefined), "");
  assert.equal(scalarTag(42), "");
});

test("toDate accepts dates and ISO strings, and never returns an invalid Date", () => {
  const date = new Date("2026-02-03T00:00:00.000Z");
  assert.equal(toDate(date)?.toISOString(), date.toISOString());
  assert.equal(toDate("2026-02-03")?.getUTCFullYear(), 2026);
  assert.equal(toDate("not a date"), null);
  assert.equal(toDate(""), null);
  assert.equal(toDate(null), null);
});

test("slugify produces a safe, bounded slug", () => {
  assert.equal(slugify("  Why B-trees Beat LSM?  "), "why-b-trees-beat-lsm");
  assert.equal(slugify("Ünïcode & symbols!"), "unicode-symbols", "transliterated, not stripped");
  assert.equal(slugify("x".repeat(200)).length, 96);
});

/* ----------------------------------------------------------------- courses */

const topics = (): CourseTopic[] => [
  {
    title: "Basics",
    links: [
      { title: "One", slug: "one", postSlugs: ["one"] },
      { title: "Two", slug: "two", postSlugs: ["two"] },
    ],
  },
  { title: "Advanced", links: [{ title: "Three", slug: "three", postSlugs: ["three"] }] },
];

test("moveItem reorders and clamps out-of-range destinations", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 0), ["c", "a", "b"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 99), ["b", "c", "a"], "clamped");
  assert.deepEqual(moveItem(["a", "b", "c"], 9, 0), ["a", "b", "c"], "bad source is a no-op");
});

test("topic and lesson edits do not mutate the input", () => {
  const before = topics();
  const after = addTopic(before, "Extras");
  assert.equal(before.length, 2, "input untouched");
  assert.equal(after.length, 3);
  assert.deepEqual(removeTopic(after, 2), before);

  const withLesson = addLesson(before, 0, { title: "Four", slug: "four", postSlugs: ["four"] });
  assert.equal(before[0].links.length, 2, "input untouched");
  assert.equal(withLesson[0].links.length, 3);
  assert.deepEqual(removeLesson(withLesson, 0, 2), before);
});

test("moveLesson reorders within a topic and moves across topics", () => {
  const within = moveLesson(topics(), { topic: 0, lesson: 0 }, { topic: 0, lesson: 1 });
  assert.deepEqual(
    within[0].links.map((l) => l.slug),
    ["two", "one"],
  );

  const across = moveLesson(topics(), { topic: 0, lesson: 0 }, { topic: 1, lesson: 0 });
  assert.deepEqual(
    across[0].links.map((l) => l.slug),
    ["two"],
  );
  assert.deepEqual(
    across[1].links.map((l) => l.slug),
    ["one", "three"],
  );

  assert.deepEqual(
    moveLesson(topics(), { topic: 9, lesson: 0 }, { topic: 0, lesson: 0 }),
    topics(),
    "a bad source is a no-op",
  );
});

test("validateCourseReferences catches every way a lesson can 404", () => {
  const published = new Set(["one", "two", "three"]);
  assert.deepEqual(validateCourseReferences(topics(), published), [], "a sound course is clean");

  const broken: CourseTopic[] = [
    {
      title: "Basics",
      links: [
        { title: "One", slug: "one", postSlugs: ["gone"] },
        { title: "Empty", slug: "empty", postSlugs: [] },
        { title: "Dupe", slug: "one", postSlugs: ["two"] },
      ],
    },
  ];
  const problems = validateCourseReferences(broken, published);
  const kinds = problems.map((problem) => problem.kind);

  assert.ok(kinds.includes("missing-post"), "unpublished target");
  assert.ok(kinds.includes("empty-lesson"), "no postSlugs at all");
  assert.ok(kinds.includes("duplicate-lesson-slug"), "second one is unreachable");

  assert.deepEqual(
    validateCourseReferences([], published).map((problem) => problem.kind),
    ["no-lessons"],
  );
});

test("preview tokens name one document, expire, and resist tampering", () => {
  process.env.PAGE_ACCESS_SECRET = "preview-test-secret";

  const now = Date.now();
  const token = issuePreviewToken({ section: "blog", slug: "a-post" }, now);
  assert.ok(token);

  assert.deepEqual(verifyPreviewToken(token, now + 1000), { section: "blog", slug: "a-post" });

  assert.equal(verifyPreviewToken(token, now + PREVIEW_TTL_SECONDS * 1000 + 1), null, "expired");
  assert.equal(verifyPreviewToken(`${token}x`, now), null, "tampered signature");
  assert.equal(verifyPreviewToken("nonsense", now), null);
  assert.equal(verifyPreviewToken(null, now), null);

  // Re-encoding the payload for a different slug must not verify.
  const forged = `${Buffer.from(`blog:other:${now + 60000}`).toString("base64url")}.${token.split(".")[1]}`;
  assert.equal(verifyPreviewToken(forged, now), null, "payload swapped under a valid signature");
});

test("findDangerousMarkup blocks script-bearing bodies but not code samples", () => {
  const kinds = (body: string) => findDangerousMarkup(body).map((problem) => problem.detail);

  assert.equal(kinds("<script>alert(1)</script>").length, 1);
  assert.equal(kinds('<iframe src="x">').length, 1);
  assert.equal(kinds('<div onclick="steal()">hi</div>').length, 1);
  assert.equal(kinds('<a href="javascript:alert(1)">x</a>').length, 1);

  assert.deepEqual(kinds("Plain prose with <Feedback> and $x^2$."), [], "ordinary body");
  assert.deepEqual(
    kinds("Here is markup:\n\n```html\n<script>alert(1)</script>\n```\n"),
    [],
    "a fenced example is documentation, not live markup",
  );
  assert.deepEqual(kinds("Inline `<script>` mention."), [], "inline code is not markup");
});

test("publishing blocks on silent breakage but not on cosmetic gaps", () => {
  const base = {
    section: "blog" as const,
    slug: "t",
    title: "T",
    summary: "A summary.",
    bodyFormat: "mdx",
    status: "draft",
    tag: "Systems",
    image: "",
    publishedAt: null,
  };
  const blocking = (document: Parameters<typeof checkCheckable>[0]) =>
    checkCheckable(document)
      .filter((problem) => problem.severity === "error")
      .map((problem) => problem.rule);

  const sound = { ...base, body: "Opening paragraph.\n\n## Heading\n\nWords." };
  assert.deepEqual(blocking(sound), [], "a sound piece publishes");

  // Cosmetic: renders, just not ideally. Must not stop a publish.
  assert.deepEqual(blocking({ ...sound, tag: "" }), [], "a missing tag only warns");
  assert.deepEqual(blocking({ ...sound, summary: "" }), [], "a missing summary only warns");
  assert.ok(
    checkCheckable({ ...sound, tag: "" }).some((problem) => problem.severity === "warning"),
    "but it is still reported",
  );

  // Silent breakage: renders wrong with no error anywhere.
  assert.ok(
    blocking({ ...sound, body: "## Straight into a heading\n\nWords." }).includes("dropcap"),
  );
  assert.ok(
    blocking({ ...sound, body: "Opening paragraph with no headings at all." }).includes("headings"),
  );
  assert.ok(blocking({ ...sound, body: "Opening.\n\n## H\n\nTODO finish this" }).includes("prose"));
  assert.ok(blocking({ ...sound, image: "/images/not-on-disk.png" }).includes("image"));
  assert.ok(
    blocking({ ...sound, body: "Opening.\n\n## H\n\n<script>x</script>" }).includes("html"),
  );
});

test("resumePoint picks the newest started-but-unfinished piece", () => {
  const state: ReaderState = {
    progress: {
      finished: {
        slug: "finished",
        href: "/a",
        title: "A",
        minutes: 5,
        percent: 99,
        updatedAt: 300,
      },
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
  assert.deepEqual(
    savedList(state).map((s) => s.slug),
    ["new", "old"],
  );
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
