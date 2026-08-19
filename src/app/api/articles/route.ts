import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";
import { getContentBySlug, saveContent } from "@/lib/content-repository";
import type { ContentSection } from "@/types/content.types";

const SECTIONS: ContentSection[] = ["blog", "learn", "explainers", "work"];

/** The editor is localhost-only, and so is its API. */
async function guard() {
  const requestHeaders = await headers();
  return isLocalArticleEditorHost(requestHeaders.get("host"));
}

export async function GET(request: Request) {
  if (!(await guard())) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const section = (searchParams.get("section") as ContentSection) || "blog";
  if (!slug) return NextResponse.json({ message: "slug is required" }, { status: 400 });
  if (!SECTIONS.includes(section)) {
    return NextResponse.json({ message: "Unknown section" }, { status: 400 });
  }

  const record = await getContentBySlug(section, slug, { includeUnpublished: true });
  if (!record) return NextResponse.json({ message: "Article not found" }, { status: 404 });

  return NextResponse.json(record);
}

export async function POST(request: Request) {
  if (!(await guard())) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const content = String(body?.content ?? "");
  const section = (body?.section as ContentSection) || "blog";

  if (!title) return NextResponse.json({ message: "A title is required" }, { status: 400 });
  if (!SECTIONS.includes(section)) {
    return NextResponse.json({ message: "Unknown section" }, { status: 400 });
  }

  try {
    const record = await saveContent({
      section,
      slug: body?.slug ? String(body.slug) : undefined,
      title,
      summary: String(body?.summary ?? ""),
      content,
      bodyFormat: body?.bodyFormat === "html" ? "html" : "mdx",
      image: body?.image ? String(body.image) : undefined,
      tag: body?.tag ? String(body.tag) : undefined,
      publish: Boolean(body?.publish),
      storage: body?.storage === "mdx" || body?.storage === "mongodb" ? body.storage : undefined,
    });

    return NextResponse.json({
      slug: record.slug,
      section: record.section,
      status: record.status,
      storage: record.source.type,
    });
  } catch (error) {
    console.error("Saving article failed:", error);
    return NextResponse.json(
      { message: (error as Error).message || "Could not save the article" },
      { status: 500 },
    );
  }
}
