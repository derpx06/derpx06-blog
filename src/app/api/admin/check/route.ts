import { NextResponse } from "next/server";
import { checkCheckable, type CheckableDocument } from "@/lib/admin/editorial-check";
import { SECTIONS } from "@/lib/admin/content-writes";
import { badRequest, guardAdminRequest, isResponse, readJson } from "@/lib/admin/route-helpers";
import type { ContentSection } from "@/types/content.types";

export const dynamic = "force-dynamic";

type Body = {
  section: ContentSection;
  slug?: string;
  title?: string;
  summary?: string;
  body?: string;
  bodyFormat?: string;
  tag?: string;
  image?: string;
  status?: string;
  publishedAt?: string | null;
};

/**
 * POST — lint an unsaved draft.
 *
 * The editor calls this as you type, so the limit is generous and nothing is
 * written. It runs the same rules as `npm run content:check`.
 */
export async function POST(request: Request) {
  const guard = await guardAdminRequest(request, "check", 600);
  if (isResponse(guard)) return guard;

  const body = await readJson<Body>(request);
  if (!body) return badRequest("Expected a JSON body");
  if (!SECTIONS.includes(body.section)) return badRequest("Unknown section");

  const published = body.publishedAt ? new Date(body.publishedAt) : null;

  const document: CheckableDocument = {
    section: body.section,
    slug: body.slug ?? "",
    title: body.title ?? "",
    summary: body.summary ?? "",
    body: body.body ?? "",
    bodyFormat: body.bodyFormat ?? "mdx",
    status: body.status ?? "draft",
    tag: body.tag ?? "",
    image: body.image ?? "",
    publishedAt: published && !Number.isNaN(published.getTime()) ? published : null,
  };

  const problems = checkCheckable(document);

  return NextResponse.json({
    problems,
    errors: problems.filter((problem) => problem.severity === "error").length,
    warnings: problems.filter((problem) => problem.severity === "warning").length,
  });
}
