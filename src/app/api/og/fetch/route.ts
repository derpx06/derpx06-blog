import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";
import { safeFetch } from "@/lib/safe-fetch";

// Node, not edge: safeFetch resolves the hostname with node:dns before letting
// the request out, which the edge runtime cannot do.
export const runtime = "nodejs";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeHTMLEntities(text: string): string {
  return text.replace(/&(#?[a-zA-Z0-9]+);/g, (match, entity: string) => {
    if (entity.startsWith("#")) {
      const code = entity.startsWith("#x")
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function extractMetadata(html: string) {
  const title = /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1] ?? "";
  const description =
    /<meta[^>]*name="description"[^>]*content="([^"]+)"[^>]*>/i.exec(html)?.[1] ??
    /<meta[^>]*content="([^"]+)"[^>]*name="description"[^>]*>/i.exec(html)?.[1] ??
    /<meta[^>]*property="og:description"[^>]*content="([^"]+)"[^>]*>/i.exec(html)?.[1] ??
    "";
  const image =
    /<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/i.exec(html)?.[1] ??
    /<meta[^>]*content="([^"]+)"[^>]*property="og:image"[^>]*>/i.exec(html)?.[1] ??
    "";

  return {
    title: decodeHTMLEntities(title.trim()),
    description: decodeHTMLEntities(description.trim()),
    image: image.trim(),
  };
}

/**
 * Reads the OpenGraph card for a URL, for the editor's link previews. Same
 * reasoning as ../proxy: localhost-only, and every fetch is vetted.
 */
export async function GET(request: Request) {
  const requestHeaders = await headers();
  if (!isLocalArticleEditorHost(requestHeaders.get("host"))) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url).searchParams.get("url");
  const result = await safeFetch(url);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: result.status });
  }

  const contentType = result.response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return NextResponse.json({ error: "That URL is not an HTML page" }, { status: 415 });
  }

  const html = new TextDecoder().decode(result.body);
  return NextResponse.json({ ...extractMetadata(html), url });
}
