import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import { slugify } from "@/lib/slug";
import { SECTIONS, mongoEnabled, type Section, type Source } from "@/utils/utils";

const isSection = (s: unknown): s is Section => SECTIONS.includes(s as Section);
const dirOf = (section: Section, kind: "drafts" | "posts") => path.join(process.cwd(), "src", "app", section, kind);
const yamlStr = (s: string) => JSON.stringify(String(s)); // JSON strings are valid YAML double-quoted scalars
const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

type ArticleMeta = {
  title: string; summary: string; image: string; tag: string; topics: string[]; publishedAt: string;
  section: Section; published: boolean; sources: Source[];
};

function frontmatter(m: ArticleMeta): string {
  const lines = [
    "---",
    `title: ${yamlStr(m.title)}`,
    `publishedAt: ${yamlStr(m.publishedAt)}`,
    `summary: ${yamlStr(m.summary)}`,
    `image: ${yamlStr(m.image)}`,
    `tag: ${yamlStr(m.tag)}`,
  ];
  if (m.topics.length) lines.push("topics:", ...m.topics.map((t) => `  - ${yamlStr(t)}`));
  else lines.push("topics: []");
  if (m.sources.length) {
    lines.push("sources:");
    for (const s of m.sources) {
      lines.push(`  - title: ${yamlStr(s.title)}`, `    url: ${yamlStr(s.url)}`);
      if (s.authors) lines.push(`    authors: ${yamlStr(s.authors)}`);
      if (s.year) lines.push(`    year: ${yamlStr(s.year)}`);
    }
  }
  lines.push("---", "", "");
  return lines.join("\n");
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function parseSources(v: unknown): Source[] | string {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.length > 50) return "Sources must be a list of at most 50 items";
  const out: Source[] = [];
  for (const raw of v) {
    const r = (raw ?? {}) as Record<string, unknown>;
    const title = str(r.title), url = str(r.url), authors = str(r.authors), year = str(r.year);
    if (!title && !url) continue; // empty row in the editor
    if (!title) return `Source ${url} needs a title`;
    if (!/^https?:\/\/\S+$/.test(url)) return `Source "${title}" needs an http(s) URL`;
    out.push({ title, url, ...(authors && { authors }), ...(year && { year }) });
  }
  return out;
}

function revalidate(section: Section, slug: string) {
  for (const p of ["/", `/${section}`, `/${section}/${slug}`, "/admin", "/sitemap.xml", "/api/rss"]) revalidatePath(p);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return json({ message: "Unauthorized" }, 401);
  if (!isAdminEmail(session.user?.email)) return json({ message: "Forbidden" }, 403);
  return null;
}

function readParams(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const section = req.nextUrl.searchParams.get("section") ?? "blog";
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: json({ message: "Missing or invalid slug" }, 400) };
  if (!isSection(section)) return { error: json({ message: "Invalid section" }, 400) };
  return { slug, section };
}

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const p = readParams(req);
  if ("error" in p) return p.error;
  const { slug, section } = p;

  if (mongoEnabled()) {
    try {
      const { db } = await connectToDatabase();
      const doc = await db.collection("articles").findOne({ slug, section });
      if (doc) {
        const { content, _id, ...meta } = doc;
        return json({ source: "mongodb", content, meta });
      }
    } catch (e) {
      console.error("MongoDB lookup failed:", e);
    }
  }

  for (const kind of ["drafts", "posts"] as const) {
    const file = path.join(dirOf(section, kind), `${slug}.mdx`);
    if (!fs.existsSync(file)) continue;
    const { data, content } = matter(fs.readFileSync(file, "utf8"));
    return json({ source: "mdx", content, meta: { ...data, section, published: kind === "posts" } });
  }
  return json({ message: "Not found" }, 404);
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const b = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;

  // Dashboard toggle: flip `published` on an existing Mongo doc without resending content.
  if (b.action === "setPublished") {
    const slug = str(b.slug), section = b.section;
    if (!slug || !isSection(section)) return json({ message: "Invalid slug or section" }, 400);
    const matched = await connectToDatabase()
      .then(({ db }) => db.collection("articles").updateOne({ slug, section }, { $set: { published: !!b.published, updatedAt: new Date().toISOString() } }))
      .then((r) => r.matchedCount, (e) => { console.error("Failed to toggle article:", e); return null; });
    if (matched === null) return json({ message: "Database unavailable, try again" }, 503);
    if (!matched) return json({ message: "Only MongoDB articles can be toggled here" }, 404);
    revalidate(section, slug);
    return json({ slug, section, published: !!b.published });
  }

  const title = str(b.title);
  const content = typeof b.content === "string" ? b.content : "";
  if (!title) return json({ message: "Title is required" }, 400);
  if (!content.trim()) return json({ message: "Content is empty" }, 400);
  const slug = slugify(str(b.slug) || title);
  if (!slug) return json({ message: "Could not derive a slug" }, 400);
  const section = b.section ?? "blog";
  if (!isSection(section)) return json({ message: "Invalid section" }, 400);
  const sources = parseSources(b.sources);
  if (typeof sources === "string") return json({ message: sources }, 400);
  const publishedAt = typeof b.publishedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.publishedAt)
    ? b.publishedAt
    : new Date().toISOString().slice(0, 10);
  const topics = Array.isArray(b.topics) ? b.topics.filter((t): t is string => typeof t === "string" && !!t.trim()).map((t) => t.trim()) : [];
  const publish = !!b.publish;
  const meta: ArticleMeta = { title, summary: str(b.summary), image: str(b.image), tag: str(b.tag), topics, publishedAt, section, published: publish, sources };
  const storage = b.storage || process.env.DEFAULT_ARTICLE_STORAGE || (mongoEnabled() ? "mongodb" : "mdx");
  const now = new Date().toISOString();

  if (storage === "mongodb") {
    try {
      const { db } = await connectToDatabase();
      await db.collection("articles").updateOne(
        { slug, section },
        { $set: { slug, content, ...meta, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
    } catch (e) {
      console.error("Failed to save article to MongoDB:", e);
      return json({ message: "Failed to save to MongoDB" }, 500);
    }
  } else if (storage === "mdx") {
    try {
      const dir = dirOf(section, publish ? "posts" : "drafts");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${slug}.mdx`), frontmatter(meta) + content.replace(/\s+$/, "") + "\n", "utf8");
      if (publish) {
        const draft = path.join(dirOf(section, "drafts"), `${slug}.mdx`);
        if (fs.existsSync(draft)) fs.unlinkSync(draft);
      }
    } catch (e) {
      // Serverless hosts (Netlify) have a read-only filesystem.
      console.error("Failed to write MDX:", e);
      return json({ message: "Can't write MDX files on this server. Switch storage to MongoDB." }, 500);
    }
  } else {
    return json({ message: "Invalid storage" }, 400);
  }
  revalidate(section, slug);
  return json({ slug, section, storage, published: publish });
}

/** Deletes the Mongo doc and/or MDX draft. Published MDX files are git-tracked, so delete those in the repo. */
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const p = readParams(req);
  if ("error" in p) return p.error;
  const { slug, section } = p;

  let removed = 0;
  try {
    if (mongoEnabled()) {
      const { db } = await connectToDatabase();
      removed += (await db.collection("articles").deleteOne({ slug, section })).deletedCount;
    }
    const draft = path.join(dirOf(section, "drafts"), `${slug}.mdx`);
    if (fs.existsSync(draft)) { fs.unlinkSync(draft); removed++; }
  } catch (e) {
    console.error("Failed to delete article:", e);
    return json({ message: "Delete failed, try again" }, 500);
  }
  if (!removed) {
    const published = fs.existsSync(path.join(dirOf(section, "posts"), `${slug}.mdx`));
    return json({ message: published ? "Published MDX posts live in git; delete the file in the repo" : "Not found" }, published ? 409 : 404);
  }
  revalidate(section, slug);
  return json({ slug, section, deleted: true });
}
