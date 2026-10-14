import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { connectToDatabase } from "@/lib/mongodb";

type Team = {
  name: string;
  role: string;
  avatar: string;
  linkedIn: string;
};

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
  images: string[];
  tag?: string;
  topics?: string[];
  team: Team[];
  link?: string;
  sources?: Source[];
};

export type Source = { title: string; url: string; authors?: string; year?: string };
export type Section = "blog" | "explainers";
export const SECTIONS: Section[] = ["blog", "explainers"];

export const mongoEnabled = () => ["1", "true"].includes((process.env.USE_MONGODB || "false").toLowerCase());

/** Cover images that will actually load: remote URLs, or files that exist under /public. */
export function showableImage(image?: string): string | null {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) return image;
  return fs.existsSync(path.join(process.cwd(), "public", image)) ? image : null;
}

function toSources(v: unknown): Source[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({ title: String(s.title ?? "").trim(), url: String(s.url ?? "").trim(), authors: s.authors ? String(s.authors) : undefined, year: s.year ? String(s.year) : undefined }))
    .filter((s) => s.title && /^https?:\/\//.test(s.url));
}

import { notFound } from "next/navigation";

function getMDXFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = entries.map((entry) => {
    const res = path.resolve(dir, entry.name);
    return entry.isDirectory() ? getMDXFiles(res) : res;
  });

  return Array.prototype.concat(...files).filter((file) => path.extname(file) === ".mdx");
}

function readMDXFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(rawContent);

  const metadata: Metadata = {
    title: data.title || "",
    publishedAt: data.publishedAt,
    summary: data.summary || "",
    image: data.image || "",
    images: data.images || [],
    tag: data.tag || [],
    topics: data.topics || [],
    team: data.team || [],
    link: data.link || "",
    sources: toSources(data.sources),
  };

  return { metadata, content };
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir);
  return mdxFiles.map((file) => {
    // file is now an absolute path
    const { metadata, content } = readMDXFile(file);
    const slug = path.basename(file, path.extname(file));

    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getPosts(customPath = ["", "", "", ""]) {
  const postsDir = path.join(process.cwd(), ...customPath);
  return getMDXData(postsDir);
}

/** MDX posts merged with published Mongo docs for `section` (DB wins on slug clash). MDX only when USE_MONGODB is off. */
export async function getPostsHybrid(customPath: string[], section: Section) {
  const mdxPosts = getPosts(customPath);
  if (!mongoEnabled()) return mdxPosts;

  try {
    const { db } = await connectToDatabase();
    const docs = await db.collection("articles").find({ published: true, section }).toArray();
    const combined = [...mdxPosts];
    for (const doc of docs) {
      const p = {
        metadata: {
          title: doc.title || "",
          publishedAt: doc.publishedAt || doc.createdAt || "",
          summary: doc.summary || "",
          image: doc.image || "",
          images: doc.images || [],
          tag: doc.tag || [],
          topics: doc.topics || [],
          team: doc.team || [],
          link: doc.link || "",
          sources: toSources(doc.sources),
        } as Metadata,
        slug: doc.slug as string,
        content: (doc.content as string) || "",
      };
      const idx = combined.findIndex((c) => c.slug === p.slug);
      if (idx >= 0) combined[idx] = p;
      else combined.push(p);
    }
    return combined;
  } catch (e) {
    console.error("Failed to fetch posts from MongoDB:", e);
    return mdxPosts;
  }
}

export type AdminArticle = {
  slug: string; section: Section; title: string; published: boolean;
  storage: "mdx" | "mongodb"; publishedAt: string; updatedAt: string; sources: number;
};

/** Everything an admin can manage: MDX posts + drafts and all Mongo docs. Mongo wins on slug+section clash. */
export async function getAllArticlesForAdmin(): Promise<AdminArticle[]> {
  const byKey = new Map<string, AdminArticle>();
  for (const section of SECTIONS) {
    for (const kind of ["posts", "drafts"] as const) {
      for (const file of getMDXFiles(path.join(process.cwd(), "src", "app", section, kind))) {
        const { data } = matter(fs.readFileSync(file, "utf8"));
        const slug = path.basename(file, ".mdx");
        byKey.set(`${section}/${slug}`, {
          slug, section, title: data.title || slug, published: kind === "posts", storage: "mdx",
          publishedAt: String(data.publishedAt ?? ""), updatedAt: fs.statSync(file).mtime.toISOString(),
          sources: toSources(data.sources).length,
        });
      }
    }
  }
  if (mongoEnabled()) {
    try {
      const { db } = await connectToDatabase();
      for (const d of await db.collection("articles").find({}, { projection: { content: 0 } }).toArray()) {
        const section: Section = d.section === "explainers" ? "explainers" : "blog";
        byKey.set(`${section}/${d.slug}`, {
          slug: d.slug, section, title: d.title || d.slug, published: !!d.published, storage: "mongodb",
          publishedAt: String(d.publishedAt ?? ""), updatedAt: String(d.updatedAt ?? d.createdAt ?? ""),
          sources: toSources(d.sources).length,
        });
      }
    } catch (e) {
      console.error("Failed to list MongoDB articles:", e);
    }
  }
  return [...byKey.values()].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}
