import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";
import { safeFetch } from "@/lib/safe-fetch";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/avif"];

/**
 * Image proxy for the link-preview cards in the editor. Nothing on the public
 * site calls it, so it is gated to the same localhost-only surface as the
 * editor itself, and every fetch goes through `safeFetch` — an unrestricted
 * server-side fetch of a caller-supplied URL is a request forgery primitive.
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

  const contentType = (result.response.headers.get("content-type") || "").split(";")[0].trim();
  if (!IMAGE_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "That URL is not an image" }, { status: 415 });
  }

  return new NextResponse(result.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
