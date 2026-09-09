import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown, mathToMarkdown } from "mdast-util-math";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";

// The exact extension set the MDXEditor maths plugin configures. If these drift
// apart, the editor will mangle LaTeX that this test says is safe.
const parse = (markdown: string) =>
  fromMarkdown(markdown, {
    extensions: [mdxjs(), gfm(), math()],
    mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()],
  });

const serialise = (tree: ReturnType<typeof parse>) =>
  toMarkdown(tree, { extensions: [mdxToMarkdown(), gfmToMarkdown(), mathToMarkdown()] });

type MathNode = { type: string; value: string; meta?: string | null };

function mathNodes(node: unknown, out: MathNode[] = []): MathNode[] {
  if (!node || typeof node !== "object") return out;
  const candidate = node as { type?: string; value?: unknown; children?: unknown };
  if (
    (candidate.type === "math" || candidate.type === "inlineMath") &&
    typeof candidate.value === "string"
  ) {
    out.push(node as MathNode);
  }
  if (Array.isArray(candidate.children)) {
    for (const child of candidate.children) mathNodes(child, out);
  }
  return out;
}

function roundTrip(markdown: string) {
  const before = mathNodes(parse(markdown));
  const after = mathNodes(parse(serialise(parse(markdown))));
  return { before, after };
}

function assertStable(markdown: string, label: string) {
  const { before, after } = roundTrip(markdown);
  assert.deepEqual(
    after.map((node) => [node.type, node.value, node.meta ?? null]),
    before.map((node) => [node.type, node.value, node.meta ?? null]),
    `maths drifted in ${label}`,
  );
  return before;
}

type SnapshotDoc = { section: string; slug: string; content?: string; bodyFormat?: string };

const snapshot = JSON.parse(
  readFileSync(path.join(process.cwd(), "content-snapshot.json"), "utf8"),
) as { content: SnapshotDoc[] };

const mathDocs = snapshot.content
  .filter((doc) => doc.bodyFormat !== "html" && typeof doc.content === "string")
  .map((doc) => ({ doc, nodes: mathNodes(parse(doc.content as string)) }))
  .filter((entry) => entry.nodes.length > 0);

test("the snapshot really contains maths documents", () => {
  assert.ok(
    mathDocs.length >= 10,
    `expected at least 10 documents with maths, found ${mathDocs.length}`,
  );
});

test("every published maths body round-trips byte-identically", () => {
  for (const { doc } of mathDocs) {
    assertStable(doc.content as string, `${doc.section}/${doc.slug}`);
  }
});

const cases: Array<[string, string, string]> = [
  ["greek", "Inline $\\alpha + \\beta$ here.\n", "\\alpha + \\beta"],
  ["subscript", "Inline $x_1 + x_2$ here.\n", "x_1 + x_2"],
  ["fraction", "Inline $\\frac{a}{b}$ here.\n", "\\frac{a}{b}"],
  ["line break", "$$\na \\\\\nb\n$$\n", "a \\\\\nb"],
  ["braces in block", "$$\n\\sum_{i=1}^{n} \\frac{x_i}{n}\n$$\n", "\\sum_{i=1}^{n} \\frac{x_i}{n}"],
  [
    "mixed braces",
    "$$\n\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}\n$$\n",
    "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
  ],
];

test("LaTeX backslash sequences survive a round trip", () => {
  for (const [label, source, expected] of cases) {
    const nodes = assertStable(source, label);
    assert.equal(nodes.length, 1, `${label} should parse to exactly one maths node`);
    assert.equal(nodes[0].value, expected, `${label} parsed to the wrong value`);
  }
});

test("maths source is emitted byte-identically", () => {
  for (const [label, source] of cases) {
    assert.equal(serialise(parse(source)), source, `${label} did not serialise byte-identically`);
  }
});

test("the maths syntax extension is what stops acorn choking on braces", () => {
  // This is the failure the plugin exists to prevent: without the maths syntax
  // extension, micromark-extension-mdxjs feeds LaTeX braces to acorn and throws.
  const withoutMath = (markdown: string) =>
    fromMarkdown(markdown, {
      extensions: [mdxjs(), gfm()],
      mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown()],
    });

  const casualties = mathDocs.filter(({ doc }) => {
    try {
      withoutMath(doc.content as string);
      return false;
    } catch {
      return true;
    }
  });

  assert.ok(casualties.length > 0, "expected some bodies to be unparseable without math()");
  for (const { doc } of casualties) {
    assert.doesNotThrow(() => parse(doc.content as string), `${doc.section}/${doc.slug}`);
  }
});
