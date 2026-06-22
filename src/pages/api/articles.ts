import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import fs from "fs";
import path from "path";
import { slugify as slugifyTrans } from "transliteration";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { slug } = req.query as { slug?: string };
    if (!slug) return res.status(400).json({ message: "Missing slug" });

    // Try MongoDB first if enabled
    try {
      const useMongo = (process.env.USE_MONGODB || "false").toLowerCase();
      if (useMongo === "1" || useMongo === "true") {
        const { db } = await connectToDatabase();
        const doc = await db.collection("articles").findOne({ slug });
        if (doc) {
          return res.status(200).json({
            source: "mongodb",
            content: doc.content,
            metadata: {
              title: doc.title,
              summary: doc.summary,
              publishedAt: doc.publishedAt,
              image: doc.image,
            },
          });
        }
      }
    } catch (e) {
      // ignore DB errors and fallback to filesystem
      console.error("MongoDB lookup failed:", e);
    }

    const candidates = [
      path.join(process.cwd(), "src", "app", "blog", "drafts", `${slug}.mdx`),
      path.join(process.cwd(), "src", "app", "blog", "posts", `${slug}.mdx`),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf8");
        return res.status(200).json({ content: raw });
      }
    }

    return res.status(404).json({ message: "Not found" });
  }

  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { title, summary, content, publish, storage } = req.body;
  if (!title || !content) return res.status(400).json({ message: "Missing title or content" });

  const slug = slugifyTrans(title).toLowerCase();
  const desiredStorage = storage || process.env.DEFAULT_ARTICLE_STORAGE || ((process.env.USE_MONGODB || "false").toLowerCase() === "true" ? "mongodb" : "mdx");

  const now = new Date().toISOString();

  if (desiredStorage === "mongodb") {
    try {
      const { db } = await connectToDatabase();
      await db.collection("articles").updateOne(
        { slug },
        {
          $set: {
            slug,
            title,
            summary: summary || "",
            content,
            image: (req.body.image as string) || "",
            images: req.body.images || [],
            topics: req.body.topics || [],
            tag: req.body.tag || [],
            team: req.body.team || [],
            updatedAt: now,
            published: !!publish,
            publishedAt: publish ? now : null,
            createdAt: now,
          },
        },
        { upsert: true }
      );

      return res.status(200).json({ slug, storage: "mongodb" });
    } catch (e) {
      console.error("Failed to save article to MongoDB:", e);
      return res.status(500).json({ message: "Failed to save to MongoDB" });
    }
  }

  // Fallback: save as MDX file
  const contentDir = publish
    ? path.join(process.cwd(), "src", "app", "blog", "posts")
    : path.join(process.cwd(), "src", "app", "blog", "drafts");
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

  const filename = path.join(contentDir, `${slug}.mdx`);
  const safeTitle = String(title).replace(/\"/g, '\\"');
  const safeSummary = String(summary || "").replace(/\"/g, '\\"');
  const frontmatter = `---\nsummary: "${safeSummary}"\ntitle: "${safeTitle}"\npublishedAt: "${publish ? now : ""}"\nimage: "${(req.body.image as string) || ""}"\n---\n\n`;

  fs.writeFileSync(filename, frontmatter + content, "utf8");

  return res.status(200).json({ slug, storage: "mdx" });
}
