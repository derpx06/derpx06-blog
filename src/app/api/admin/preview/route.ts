import { NextResponse } from "next/server";
import { SECTIONS } from "@/lib/admin/content-writes";
import { issuePreviewToken, PREVIEW_TTL_SECONDS } from "@/lib/admin/preview-token";
import { badRequest, guardAdminRequest, isResponse, readJson } from "@/lib/admin/route-helpers";
import type { ContentSection } from "@/types/content.types";

export const dynamic = "force-dynamic";

/** POST — mint a link that renders a draft through the real article template. */
export async function POST(request: Request) {
  const guard = await guardAdminRequest(request, "preview", 120);
  if (isResponse(guard)) return guard;

  const body = await readJson<{ section: ContentSection; slug: string }>(request);
  if (!body?.slug) return badRequest("A slug is required");
  if (!SECTIONS.includes(body.section)) return badRequest("Unknown section");

  const token = issuePreviewToken({ section: body.section, slug: body.slug });
  if (!token) {
    return NextResponse.json(
      { error: "Set PAGE_ACCESS_SECRET to enable previews." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: `/preview/${token}`,
    expiresInSeconds: PREVIEW_TTL_SECONDS,
  });
}
