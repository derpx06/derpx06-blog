import { NextResponse } from "next/server";
import { getContentForAdmin, SECTIONS, upsertContent } from "@/lib/admin/content-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  revalidateContent,
  serverError,
} from "@/lib/admin/route-helpers";
import { getRevision, listRevisions, saveRevision } from "@/lib/admin/revisions";
import type { ContentSection } from "@/types/content.types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ section: string; slug: string }> };

/** GET — the document's history, newest first. */
export async function GET(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:revisions", 200);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  if (!SECTIONS.includes(section as ContentSection)) return badRequest("Unknown section");

  const items = await listRevisions(section as ContentSection, slug);
  return NextResponse.json({ items });
}

/**
 * POST — roll back to a revision.
 *
 * The rollback itself is snapshotted first, so undoing an undo is possible and
 * a mistaken restore is never a dead end.
 */
export async function POST(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:rollback", 60);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  if (!SECTIONS.includes(section as ContentSection)) return badRequest("Unknown section");

  const body = await readJson<{ revisionId: string }>(request);
  if (!body?.revisionId) return badRequest("A revisionId is required");

  try {
    const revision = await getRevision(body.revisionId);
    if (!revision || revision.section !== section || revision.slug !== slug) {
      return NextResponse.json({ error: "That revision is not for this piece" }, { status: 404 });
    }

    const current = await getContentForAdmin(section as ContentSection, slug);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await saveRevision(current, guard.user.email);

    const record = await upsertContent({
      section: section as ContentSection,
      slug,
      title: revision.title,
      summary: revision.summary,
      body: revision.body,
      bodyFormat: revision.bodyFormat,
      status: current.status,
    });

    revalidateContent(record.section, record.slug);
    return NextResponse.json({ record });
  } catch (error) {
    return serverError("Rolling back", error);
  }
}
