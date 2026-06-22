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
};

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

export async function getPostsHybrid(customPath = ["", "", "", ""]) {
  const postsDir = path.join(process.cwd(), ...customPath);
  const mdxPosts = getMDXData(postsDir);

  try {
    const useMongo = (process.env.USE_MONGODB || "false").toLowerCase();
    if (useMongo === "1" || useMongo === "true") {
      const { db } = await connectToDatabase();
      const collection = db.collection("articles");
      const docs = await collection.find({ published: true }).sort({ publishedAt: -1 }).toArray();

      const dbPosts = docs.map((doc: any) => ({
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
        },
        slug: doc.slug,
        content: doc.content || "",
      }));

      // merge: prefer DB doc when slug conflicts
      const combined = [...mdxPosts];
      for (const p of dbPosts) {
        const idx = combined.findIndex((c) => c.slug === p.slug);
        if (idx >= 0) combined[idx] = p;
        else combined.push(p);
      }

      return combined;
    }
  } catch (e) {
    console.error("Failed to fetch posts from MongoDB:", e);
  }

  return mdxPosts;
}
