/**
 * Editorial lint for everything in the content collection.
 *
 * Several of the site's features fail silently on bad input — a JSX <Heading>
 * never reaches the contents rail, an unknown code fence degrades to plaintext,
 * a stale image path ships to crawlers as a 404. This catches all of that
 * before it is published rather than after.
 *
 *   node scripts/check-content.mjs [--section blog] [--links]
 *
 * --links additionally requests every external URL (slow; off by default).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";
import { slugify as transliterate } from "transliteration";

// Mirrors src/lib/highlight.ts. Anything outside this degrades to plaintext.
const LANGS = new Set([
  "bash",
  "c",
  "cpp",
  "csharp",
  "css",
  "diff",
  "docker",
  "go",
  "graphql",
  "html",
  "ini",
  "java",
  "javascript",
  "json",
  "jsx",
  "kotlin",
  "lua",
  "markdown",
  "php",
  "python",
  "ruby",
  "rust",
  "scss",
  "shell",
  "sql",
  "swift",
  "toml",
  "tsx",
  "typescript",
  "xml",
  "yaml",
]);
const ALIASES = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  "c++": "cpp",
  md: "markdown",
  text: "plaintext",
  txt: "plaintext",
  "": "plaintext",
};

// Read-time bands, in words at 220 wpm (src/lib/pieces.ts).
const BANDS = {
  blog: [900, 2200],
  explainers: [1500, 3600],
};

const PLACEHOLDER = [
  /lorem ipsum/i,
  /john doe/i,
  /\b(TODO|FIXME|TBD)\b/,
  /magic portfolio/i,
  // Keyboard mash: a long run of letters with no vowel-shaped rhythm.
  /[bcdfghjklmnpqrstvwxz]{9,}/i,
];

function slugifyHeading(input) {
  return transliterate(String(input ?? "").replace(/&/g, " and "), {
    lowercase: true,
    separator: "-",
  }).replace(/-{2,}/g, "-");
}

/**
 * Strip everything that is not markdown prose before applying a prose rule:
 * fenced code, and JSX expression containers such as
 * `<CodeBlock codes={[{ code: `# not a heading` }]} />`, whose contents are
 * JavaScript strings and are never parsed as markdown.
 */
function withoutFences(body) {
  const withoutCode = body.replace(/```[\s\S]*?```/g, "");
  let out = "";
  let depth = 0;
  for (const char of withoutCode) {
    if (char === "{") depth += 1;
    else if (char === "}") depth = Math.max(0, depth - 1);
    else if (depth === 0) out += char;
  }
  return out;
}

/** Same arithmetic as readingMinutes() in src/lib/pieces.ts. */
function wordCount(body) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`|-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
      return;
    } catch {
      /* try the next one */
    }
  }
}

/** Resolves a public/ path the way src/lib/images.ts does. */
function imageExists(src) {
  if (/^https?:\/\//.test(src)) return true;
  if (!src.startsWith("/")) return false;
  const file = decodeURIComponent(src.split("?")[0].split("#")[0]);
  return existsSync(path.join(process.cwd(), "public", file));
}

export function checkDocument(document) {
  const problems = [];
  const fail = (rule, detail) => problems.push({ rule, detail });

  const body = document.body || "";
  // Only blog and explainers render through ArticleView, which is what supplies
  // the drop cap, the tag kicker and the archive row. Lessons render in their
  // own shell and are exempt from those rules.
  const isArticle = document.section === "blog" || document.section === "explainers";

  // --- shape -------------------------------------------------------------
  for (const field of ["section", "slug", "title", "summary", "body", "status"]) {
    if (typeof document[field] !== "string") fail("field", `${field} is not a string`);
  }
  if (document.tag !== undefined && typeof document.tag !== "string") {
    fail("field", "tag must be a string, not an array");
  }
  if (isArticle && !document.tag) fail("field", "no tag — the piece will display as “Notes”");
  if (!document.summary) fail("field", "no summary — the dek and the archive row will be blank");
  if (document.publishedAt !== null && !(document.publishedAt instanceof Date)) {
    fail("field", "publishedAt must be a BSON Date or null");
  }
  if (document.status === "published" && !document.publishedAt) {
    fail("field", "published but has no publishedAt — it will group under “Undated”");
  }

  // --- drop cap ----------------------------------------------------------
  const firstNode = body.trimStart().split(/\r?\n\s*\r?\n/)[0] ?? "";
  if (isArticle && /^[<#>]|^```|^!\[/.test(firstNode.trimStart())) {
    fail("dropcap", "body does not open with a plain paragraph, so no drop cap renders");
  }

  // --- headings ----------------------------------------------------------
  const prose = withoutFences(body);
  const headings = [...prose.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => m[2].trim());
  if (headings.length === 0) fail("headings", "no ## headings — the contents rail will be empty");

  const seen = new Map();
  for (const heading of headings) {
    const id = slugifyHeading(heading);
    if (seen.has(id))
      fail("headings", `duplicate anchor "${id}" — “${seen.get(id)}” vs “${heading}”`);
    else seen.set(id, heading);
  }

  if (/<Heading\b/.test(prose)) {
    fail("headings", "<Heading> JSX never reaches the contents rail — use ## instead");
  }
  // Every page renders document.title as its own h1 before the body, so a body
  // h1 is at best a second one and at worst the title printed twice.
  const bodyH1 = /^#\s+(.+)$/m.exec(prose);
  if (bodyH1) {
    const duplicate =
      bodyH1[1].trim().toLowerCase() === (document.title || "").trim().toLowerCase();
    fail(
      "headings",
      duplicate
        ? "body repeats the title as an H1 — the page renders it twice"
        : `body contains an H1 ("${bodyH1[1].trim()}") — the title is already the page H1`,
    );
  }

  // --- code fences -------------------------------------------------------
  for (const [, lang] of body.matchAll(/^```([A-Za-z0-9+#_-]*)\s*$/gm)) {
    const resolved = ALIASES[lang.toLowerCase()] ?? lang.toLowerCase();
    if (resolved !== "plaintext" && !LANGS.has(resolved)) {
      fail("code", `language "${lang}" is not loaded in shiki — it will render unhighlighted`);
    }
  }
  const fences = (body.match(/^```/gm) || []).length;
  if (fences % 2 !== 0) fail("code", "unbalanced code fence");

  // --- images ------------------------------------------------------------
  if (document.image && !imageExists(document.image)) {
    fail("image", `cover "${document.image}" is not on disk — it will 404 in OG and RSS`);
  }
  for (const [, src] of body.matchAll(/<(?:Image|Media)\b[^>]*\bsrc="([^"]+)"/g)) {
    if (!imageExists(src)) fail("image", `<Image src="${src}"> is not on disk`);
  }
  for (const [, src] of body.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
    if (!imageExists(src)) fail("image", `![](${src}) is not on disk`);
  }

  // --- prose -------------------------------------------------------------
  for (const pattern of PLACEHOLDER) {
    const hit = pattern.exec(prose) || pattern.exec(document.summary || "");
    if (hit) fail("prose", `placeholder or mash text: “${hit[0].slice(0, 40)}”`);
  }

  const band = isArticle ? BANDS[document.section] : null;
  if (band) {
    const words = wordCount(body);
    if (words < band[0])
      fail("length", `${words} words — under the ${band[0]} floor for ${document.section}`);
    if (words > band[1])
      fail("length", `${words} words — over the ${band[1]} ceiling for ${document.section}`);
  }

  return problems;
}

/** External URLs, checked only with --links. */
async function checkLinks(body) {
  const urls = new Set(
    [...body.matchAll(/https?:\/\/[^\s")\]<>]+/g)].map((m) => m[0].replace(/[.,;]$/, "")),
  );
  const dead = [];
  await Promise.all(
    [...urls].map(async (url) => {
      try {
        const response = await fetch(url, { method: "GET", redirect: "follow" });
        if (!response.ok) dead.push(`${url} → ${response.status}`);
      } catch (error) {
        dead.push(`${url} → ${error.cause?.code || error.message}`);
      }
    }),
  );
  return dead;
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes("--section") ? args[args.indexOf("--section") + 1] : null;
  const withLinks = args.includes("--links");

  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set — nothing to check.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const documents = await client
      .db(process.env.MONGODB_DB || "derpx06")
      .collection(process.env.MONGODB_CONTENT_COLLECTION || "content")
      .find(only ? { section: only } : {})
      .sort({ section: 1, slug: 1 })
      .toArray();

    let bad = 0;
    for (const document of documents) {
      const problems = checkDocument(document);
      if (withLinks) {
        for (const dead of await checkLinks(document.body || "")) {
          problems.push({ rule: "link", detail: dead });
        }
      }
      if (problems.length === 0) continue;

      bad += 1;
      console.log(`\n${document.section}/${document.slug}`);
      for (const { rule, detail } of problems) console.log(`  ${rule.padEnd(8)} ${detail}`);
    }

    console.log(
      `\n${documents.length} checked · ${documents.length - bad} clean · ${bad} with problems`,
    );
    if (bad) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
