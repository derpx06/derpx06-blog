import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { connectToDatabase } from "@/lib/mongodb";
import { slugify } from "@/lib/slug";

const SECTIONS = ["blog", "explainers"] as const;
type Section = (typeof SECTIONS)[number];
const isSection = (s: unknown): s is Section => SECTIONS.includes(s as Section);
const useMongo = () => ["1", "true"].includes((process.env.USE_MONGODB || "false").toLowerCase());
const dirOf = (section: Section, kind: "drafts" | "posts") => path.join(process.cwd(), "src", "app", section, kind);
const yamlStr = (s: string) => JSON.stringify(String(s)); // JSON strings are valid YAML double-quoted scalars

export type ArticleMeta = {
  title: string; summary: string; image: string; tag: string; topics: string[]; publishedAt: string;
  section: Section; published: boolean;
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
  lines.push("---", "", "");
  return lines.join("\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });
  if (!isAdminEmail(session.user?.email)) return res.status(403).json({ message: "Forbidden" });

  if (req.method === "GET") {
    const { slug, section = "blog" } = req.query as { slug?: string; section?: string };
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ message: "Missing or invalid slug" });
    if (!isSection(section)) return res.status(400).json({ message: "Invalid section" });

    if (useMongo()) {
      try {
        const { db } = await connectToDatabase();
        const doc = await db.collection("articles").findOne({ slug });
        if (doc) {
          const { content, _id, ...meta } = doc;
          return res.status(200).json({ source: "mongodb", content, meta });
        }
      } catch (e) {
        console.error("MongoDB lookup failed:", e);
      }
    }

    for (const kind of ["drafts", "posts"] as const) {
      const file = path.join(dirOf(section, kind), `${slug}.mdx`);
      if (!fs.existsSync(file)) continue;
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      return res.status(200).json({ source: "mdx", content, meta: { ...data, section, published: kind === "posts" } });
    }
    return res.status(404).json({ message: "Not found" });
  }

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const b = (req.body ?? {}) as Record<string, unknown>;
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const content = typeof b.content === "string" ? b.content : "";
  if (!title) return res.status(400).json({ message: "Title is required" });
  if (!content.trim()) return res.status(400).json({ message: "Content is empty" });
  const slug = slugify(typeof b.slug === "string" && b.slug.trim() ? b.slug : title);
  if (!slug) return res.status(400).json({ message: "Could not derive a slug" });
  const section = b.section ?? "blog";
  if (!isSection(section)) return res.status(400).json({ message: "Invalid section" });
  const publishedAt = typeof b.publishedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.publishedAt)
    ? b.publishedAt
    : new Date().toISOString().slice(0, 10);
  const topics = Array.isArray(b.topics) ? b.topics.filter((t): t is string => typeof t === "string" && !!t.trim()).map((t) => t.trim()) : [];
  const publish = !!b.publish;
  const meta: ArticleMeta = {
    title,
    summary: typeof b.summary === "string" ? b.summary.trim() : "",
    image: typeof b.image === "string" ? b.image.trim() : "",
    tag: typeof b.tag === "string" ? b.tag.trim() : "",
    topics,
    publishedAt,
    section,
    published: publish,
  };
  const storage = b.storage || process.env.DEFAULT_ARTICLE_STORAGE || (useMongo() ? "mongodb" : "mdx");
  const now = new Date().toISOString();

  if (storage === "mongodb") {
    try {
      const { db } = await connectToDatabase();
      await db.collection("articles").updateOne(
        { slug },
        { $set: { slug, content, ...meta, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
      return res.status(200).json({ slug, section, storage: "mongodb", published: publish });
    } catch (e) {
      console.error("Failed to save article to MongoDB:", e);
      return res.status(500).json({ message: "Failed to save to MongoDB" });
    }
  }
  if (storage !== "mdx") return res.status(400).json({ message: "Invalid storage" });

  const dir = dirOf(section, publish ? "posts" : "drafts");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.mdx`), frontmatter(meta) + content.replace(/\s+$/, "") + "\n", "utf8");
  if (publish) {
    const draft = path.join(dirOf(section, "drafts"), `${slug}.mdx`);
    if (fs.existsSync(draft)) fs.unlinkSync(draft);
  }
  return res.status(200).json({ slug, section, storage: "mdx", published: publish });
}
