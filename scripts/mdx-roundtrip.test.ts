/**
 * The gate that stands between the WYSIWYG editor and the published corpus.
 *
 * The admin editor parses a body into mdast and serialises it back on every
 * save. That is only safe if the trip is lossless, and it is not lossless for
 * free: the MDX *parser* strips two spaces from every continuation line of a
 * multi-line JSX attribute expression, so a `<CodeBlock codes={[{ code: `…` }]} />`
 * carrying indented Python used to lose two spaces per save until the sample no
 * longer ran. `src/lib/mdx-jsx-indent.ts` writes those spaces back, and this
 * test serialises with the very same extensions the editor does — so the gate
 * proves what the editor actually writes.
 *
 * It covers **every** document, with nothing skipped. There is no longer a
 * source view to fall back to, so a failure here is a document an editor save
 * would corrupt with no escape hatch: fix the content, do not relax the
 * assertion or reintroduce a skip.
 *
 * It runs offline against the committed snapshot, so CI needs no database.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown, mathToMarkdown } from "mdast-util-math";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { jsxIndentExtensions } from "@/lib/mdx-jsx-indent";

type Node = Record<string, any>;

const parse = (markdown: string): Node =>
  fromMarkdown(markdown, {
    extensions: [mdxjs(), gfm(), math()],
    mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()],
  }) as unknown as Node;

/**
 * Pinned so the editor and this test normalise identically — including
 * `jsxIndentExtensions()`, which must come after `mdxToMarkdown()` because the
 * last handler registered for a node type is the one `toMarkdown` uses.
 */
const serialize = (tree: Node): string =>
  toMarkdown(tree as any, {
    extensions: [mdxToMarkdown(), gfmToMarkdown(), mathToMarkdown(), jsxIndentExtensions() as any],
    listItemIndent: "one",
    bullet: "-",
    emphasis: "_",
    strong: "*",
    fence: "`",
    rule: "-",
  });

/**
 * Every string a reader can actually see: prose, fenced code, maths, and the
 * template literals still living inside JSX attributes. Position data is
 * deliberately excluded — offsets shift when whitespace is normalised and that
 * is not a content change.
 */
function visibleStrings(tree: Node): string[] {
  const found: string[] = [];

  const fromEstree = (node: any): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(fromEstree);
      return;
    }
    if (node.type === "TemplateElement" && node.value) found.push(`tpl:${node.value.cooked}`);
    if (node.type === "Literal" && typeof node.value === "string") found.push(`lit:${node.value}`);
    for (const key of Object.keys(node)) {
      if (!["loc", "range", "start", "end", "position"].includes(key)) fromEstree(node[key]);
    }
  };

  const walk = (node: Node): void => {
    if (!node || typeof node !== "object") return;
    const carriesText = ["text", "code", "inlineCode", "math", "inlineMath"].includes(node.type);
    if (carriesText && typeof node.value === "string") found.push(`${node.type}:${node.value}`);
    if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
      found.push(`jsx:${node.name}`);
    }
    for (const attribute of node.attributes ?? []) {
      if (attribute.type === "mdxJsxAttribute") {
        found.push(`attr:${attribute.name}`);
        if (typeof attribute.value === "string") found.push(`attrv:${attribute.value}`);
        if (attribute.value?.data?.estree) fromEstree(attribute.value.data.estree);
      }
    }
    (node.children ?? []).forEach(walk);
  };

  walk(tree);
  return found;
}

type Doc = { section: string; slug: string; body?: string; content?: string };

function loadCorpus(): Doc[] {
  const raw = JSON.parse(readFileSync("content-snapshot.json", "utf8"));
  const docs = Array.isArray(raw)
    ? raw
    : (Object.values(raw).find(Array.isArray) as Doc[] | undefined);
  assert.ok(docs && docs.length > 0, "content-snapshot.json holds no documents");
  return docs;
}

test("every body survives an editor save unchanged", () => {
  const corpus = loadCorpus();
  const corrupted: string[] = [];
  let checked = 0;

  for (const doc of corpus) {
    const id = `${doc.section}/${doc.slug}`;
    const body = doc.body ?? doc.content ?? "";
    if (!body) continue;
    try {
      const tree = parse(body);
      checked += 1;
      const before = visibleStrings(tree);
      const after = visibleStrings(parse(serialize(tree)));
      if (JSON.stringify(before) !== JSON.stringify(after)) corrupted.push(id);
    } catch (error) {
      corrupted.push(`${id} (threw: ${(error as Error).message.slice(0, 60)})`);
    }
  }

  assert.ok(checked > 0, "the snapshot holds no parseable bodies");
  assert.deepEqual(
    corrupted,
    [],
    `a save would change visible content in ${corrupted.length} of ${checked} document(s)`,
  );
  console.log(`    every one of ${checked} documents is editable in the canvas`);
});

test("saving twice changes nothing the second time", () => {
  const corpus = loadCorpus();
  const unstable: string[] = [];

  for (const doc of corpus) {
    const body = doc.body ?? doc.content ?? "";
    if (!body) continue;
    try {
      const once = serialize(parse(body));
      if (serialize(parse(once)) !== once) unstable.push(`${doc.section}/${doc.slug}`);
    } catch {
      // The first test already reports anything that throws.
    }
  }

  assert.deepEqual(unstable, [], `${unstable.length} document(s) drift on every save`);
});

test("code inside a fence is opaque to the serializer", () => {
  // The exact shape the migration produces, and the reason it was worth doing.
  const body = [
    "Opening paragraph.",
    "",
    '```python title="handler.py"',
    "async def handle(inputs):",
    "    # two spaces of meaning",
    "    return [x for x in inputs]",
    "```",
    "",
  ].join("\n");

  const once = serialize(parse(body));
  const code = (parse(once).children as Node[]).find((n) => n.type === "code");
  assert.equal(
    code?.value,
    "async def handle(inputs):\n    # two spaces of meaning\n    return [x for x in inputs]",
  );
  assert.equal(code?.meta, 'title="handler.py"');
  assert.equal(serialize(parse(once)), once);
});
