/**
 * Moves single-sample `<CodeBlock codes={[{…}]} />` blocks into real fenced code.
 *
 * Why this exists: a multi-line JSX *attribute expression* cannot survive an
 * edit. `mdast-util-mdx-jsx` re-indents it on every serialisation, and when the
 * `code:` template literal inside carries indented Python, that indentation is
 * content — so it is eaten, two spaces per save, until the sample is no longer
 * valid Python. Measured over the corpus, one save corrupted 48 of 111
 * documents. A fenced block has no such problem: its body is opaque to the
 * serialiser and round-trips byte-for-byte.
 *
 * It edits the body as TEXT, splicing at the mdast node's own offsets, and
 * never re-serialises the document — re-serialising is the very thing that
 * causes the damage. Everything outside a converted block stays byte-identical.
 *
 * Only fully mechanical cases convert. A block that reads a `file:`, picks a
 * notebook `cellIndex`, sets `showOutput`, holds more than one sample, or
 * interpolates `${…}` is left exactly as it was.
 *
 *   node scripts/migrate-codeblocks.mjs             # dry run, prints a report
 *   node scripts/migrate-codeblocks.mjs --write     # commit to MongoDB
 *   node scripts/migrate-codeblocks.mjs --slug why-chunking --show
 */

import process from "node:process";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { mathFromMarkdown } from "mdast-util-math";
import { mdxFromMarkdown } from "mdast-util-mdx";
import { gfm } from "micromark-extension-gfm";
import { math } from "micromark-extension-math";
import { mdxjs } from "micromark-extension-mdxjs";
import { MongoClient } from "mongodb";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Values may come from the real environment instead.
}

const args = process.argv.slice(2);
const WRITE = args.includes("--write");
const SHOW = args.includes("--show");
const ONLY = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

const parse = (md) =>
  fromMarkdown(md, {
    extensions: [mdxjs(), gfm(), math()],
    mdastExtensions: [mdxFromMarkdown(), gfmFromMarkdown(), mathFromMarkdown()],
  });

/** Walk an mdast tree, yielding every node. */
function* nodes(node) {
  yield node;
  for (const child of node.children ?? []) yield* nodes(child);
}

/**
 * The one shape we convert: `codes={[{ code: `…`, language: '…', label: '…' }]}`
 * with a plain template literal and nothing else in the object.
 */
function convertible(node) {
  if (node.type !== "mdxJsxFlowElement" || node.name !== "CodeBlock") return null;
  // A fence only means "code" at column 1; indented, it would be a code block
  // of its own with the indentation baked in.
  if (node.position?.start?.column !== 1) return null;
  if (!node.attributes) return null;

  // `marginBottom` reaches SafeCodeBlock, which reads only `codes` and
  // `minimized` — it has never rendered anything. Dropping it is a no-op.
  const IGNORED = new Set(["marginBottom"]);
  const kept = node.attributes.filter(
    (a) => !(a.type === "mdxJsxAttribute" && IGNORED.has(a.name)),
  );
  if (kept.length !== 1) return null; // showOutput / minimized need the JSX form

  const attr = kept[0];
  if (attr.type !== "mdxJsxAttribute" || attr.name !== "codes") return null;
  if (attr.value?.type !== "mdxJsxAttributeValueExpression") return null;

  const body = attr.value.data?.estree?.body;
  if (!body || body.length !== 1 || body[0].type !== "ExpressionStatement") return null;
  const array = body[0].expression;
  if (array?.type !== "ArrayExpression" || array.elements.length !== 1) return null;
  const object = array.elements[0];
  if (object?.type !== "ObjectExpression") return null;

  const fields = {};
  for (const property of object.properties) {
    if (property.type !== "Property" || property.computed) return null;
    const key = property.key.name ?? property.key.value;
    if (!["code", "language", "label"].includes(key)) return null; // file / cellIndex / showOutput
    fields[key] = property.value;
  }
  if (!fields.code) return null;

  const template = fields.code;
  if (template.type !== "TemplateLiteral") return null;
  if (template.expressions.length > 0) return null; // `${…}` — not mechanical
  if (template.quasis.length !== 1) return null;
  const code = template.quasis[0].value.cooked;
  if (typeof code !== "string") return null;

  const literal = (value) =>
    value && value.type === "Literal" && typeof value.value === "string" ? value.value : null;
  const language = literal(fields.language) ?? "text";
  const label = literal(fields.label);
  if (fields.language && language === "text" && fields.language.type !== "Literal") return null;
  if (fields.label && label === null) return null;

  return {
    code,
    language,
    label,
    start: node.position.start.offset,
    end: node.position.end.offset,
  };
}

/** A fence long enough to contain whatever backtick runs the code has. */
function fence(code, language, label) {
  const longest = (code.match(/`+/g) ?? []).reduce((n, run) => Math.max(n, run.length), 0);
  const ticks = "`".repeat(Math.max(3, longest + 1));
  const meta = label ? ` title="${label.replace(/"/g, "&quot;")}"` : "";
  const trimmed = code.replace(/^\n+/, "").replace(/\s+$/, "");
  return `${ticks}${language}${meta}\n${trimmed}\n${ticks}`;
}

/** Every code string a reader can see, so we can prove none changed. */
function codeStrings(tree) {
  const found = [];
  const estree = (n) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(estree);
    if (n.type === "TemplateElement" && n.value) found.push(n.value.cooked);
    for (const key of Object.keys(n)) {
      if (!["loc", "range", "start", "end", "position"].includes(key)) estree(n[key]);
    }
  };
  for (const node of nodes(tree)) {
    if (node.type === "code") found.push(node.value);
    for (const attribute of node.attributes ?? []) {
      if (attribute.value?.data?.estree) estree(attribute.value.data.estree);
    }
  }
  return found;
}

/** Compare ignoring only the leading/trailing blank lines a fence normalises. */
const tidy = (s) => s.replace(/^\n+/, "").replace(/\s+$/, "");

function migrateBody(body) {
  const hits = [];
  for (const node of nodes(parse(body))) {
    const hit = convertible(node);
    if (hit) hits.push(hit);
  }
  if (hits.length === 0) return { body, converted: 0, hits };

  // Back to front, so earlier offsets stay valid.
  let out = body;
  for (const hit of [...hits].sort((a, b) => b.start - a.start)) {
    out = out.slice(0, hit.start) + fence(hit.code, hit.language, hit.label) + out.slice(hit.end);
  }
  return { body: out, converted: hits.length, hits };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set (checked the environment and .env.local).");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const collection = client.db(process.env.MONGODB_DB || "derpx06").collection("content");

  const query = ONLY ? { slug: ONLY } : {};
  const documents = await collection.find(query).toArray();

  let changedDocs = 0;
  let converted = 0;
  const languages = new Map();
  const failures = [];
  const writes = [];

  for (const document of documents) {
    const body = document.body || "";
    const before = codeStrings(parse(body));
    const result = migrateBody(body);
    if (result.converted === 0) continue;

    // The whole point: every code string must survive untouched.
    const after = codeStrings(parse(result.body));
    const a = before.map(tidy).sort();
    const b = after.map(tidy).sort();
    if (a.length !== b.length || a.some((value, index) => value !== b[index])) {
      failures.push(`${document.section}/${document.slug}: code strings changed`);
      continue;
    }

    changedDocs += 1;
    converted += result.converted;
    for (const hit of result.hits) {
      languages.set(hit.language, (languages.get(hit.language) || 0) + 1);
    }
    writes.push({ _id: document._id, body: result.body });

    if (SHOW) {
      console.log(`\n=== ${document.section}/${document.slug} (${result.converted}) ===`);
      console.log(result.body.slice(0, 900));
    }
  }

  console.log(`\ndocuments scanned    ${documents.length}`);
  console.log(`documents changed    ${changedDocs}`);
  console.log(`blocks converted     ${converted}`);
  console.log(
    `languages            ${[...languages.entries()].map(([l, n]) => `${l}:${n}`).join("  ")}`,
  );
  if (failures.length) {
    console.log(`\nREFUSED (${failures.length}) — code would have changed:`);
    for (const failure of failures) console.log(`  ${failure}`);
  }

  if (!WRITE) {
    console.log(`\nDry run. Re-run with --write to commit.`);
  } else if (failures.length) {
    console.log(`\nRefusing to write while any document fails verification.`);
    process.exitCode = 1;
  } else {
    for (const write of writes) {
      await collection.updateOne(
        { _id: write._id },
        { $set: { body: write.body, updatedAt: new Date() } },
      );
    }
    console.log(`\nWrote ${writes.length} documents.`);
  }

  await client.close();
}

await main();
