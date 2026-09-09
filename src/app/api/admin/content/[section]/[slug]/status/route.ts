import { NextResponse } from "next/server";
import {
  getContentForAdmin,
  SECTIONS,
  setContentStatus,
  STATUSES,
} from "@/lib/admin/content-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  revalidateContent,
  serverError,
} from "@/lib/admin/route-helpers";
import { saveRevision } from "@/lib/admin/revisions";
import { checkRecord } from "@/lib/admin/editorial-check";
import type { ContentSection, ContentStatus } from "@/types/content.types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ section: string; slug: string }> };

/**
 * POST — publish, unpublish or restore.
 *
 * Publishing runs the editorial checks first and refuses on a hard failure:
 * these are the rules that fail silently on the live site (no drop cap, an
 * empty contents rail, an image that 404s for crawlers), so the publish button
 * is the last place they can still be caught.
 */
export async function POST(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:status", 120);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  if (!SECTIONS.includes(section as ContentSection)) return badRequest("Unknown section");

  const body = await readJson<{ status: ContentStatus; force?: boolean }>(request);
  if (!body?.status || !STATUSES.includes(body.status)) return badRequest("Unknown status");

  const address = { section: section as ContentSection, slug };

  try {
    const current = await getContentForAdmin(address.section, address.slug);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.status === "published" && !body.force) {
      const problems = await checkRecord(current);
      const blocking = problems.filter((problem) => problem.severity === "error");
      if (blocking.length > 0) {
        return NextResponse.json(
          { error: "Fix these before publishing.", problems: blocking },
          { status: 422 },
        );
      }
    }

    await saveRevision(current, guard.user.email);
    const record = await setContentStatus(address, body.status);
    revalidateContent(address.section, address.slug);

    return NextResponse.json({ record });
  } catch (error) {
    return serverError("Changing status", error);
  }
}
