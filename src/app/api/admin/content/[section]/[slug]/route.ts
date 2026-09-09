import { NextResponse } from "next/server";
import {
  ContentConflictError,
  type ContentWriteInput,
  deleteContent,
  getContentForAdmin,
  moveContent,
  SECTIONS,
  setContentStatus,
  STATUSES,
  upsertContent,
} from "@/lib/admin/content-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  requireReauth,
  revalidateContent,
  serverError,
} from "@/lib/admin/route-helpers";
import { saveRevision } from "@/lib/admin/revisions";
import type { ContentSection, ContentStatus } from "@/types/content.types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ section: string; slug: string }> };

function parseAddress(section: string, slug: string) {
  if (!SECTIONS.includes(section as ContentSection)) return null;
  if (!slug) return null;
  return { section: section as ContentSection, slug };
}

/** GET — one document at any status. The editor needs drafts and archived too. */
export async function GET(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:read", 300);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  const address = parseAddress(section, slug);
  if (!address) return badRequest("Unknown section");

  try {
    const record = await getContentForAdmin(address.section, address.slug);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ record });
  } catch (error) {
    return serverError("Reading content", error);
  }
}

type PatchBody = Partial<ContentWriteInput> & {
  /** Set to move the piece to a different section or slug. */
  moveTo?: { section: ContentSection; slug: string };
};

/** PATCH — update fields, change status, or move to a new section/slug. */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:write", 240);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  const address = parseAddress(section, slug);
  if (!address) return badRequest("Unknown section");

  const body = await readJson<PatchBody>(request);
  if (!body) return badRequest("Expected a JSON body");
  if (body.status && !STATUSES.includes(body.status)) return badRequest("Unknown status");

  try {
    const before = await getContentForAdmin(address.section, address.slug);
    if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Snapshot what is there now, so this edit is recoverable.
    await saveRevision(before, guard.user.email);

    if (body.moveTo) {
      if (!SECTIONS.includes(body.moveTo.section)) return badRequest("Unknown target section");
      if (!body.moveTo.slug?.trim()) return badRequest("A target slug is required");

      const moved = await moveContent(address, {
        section: body.moveTo.section,
        slug: body.moveTo.slug.trim(),
      });
      revalidateContent(address.section, address.slug);
      if (moved) revalidateContent(moved.section, moved.slug);
      return NextResponse.json({ record: moved });
    }

    const record = await upsertContent({
      ...body,
      section: address.section,
      slug: address.slug,
      title: body.title ?? before.metadata.title,
    });

    revalidateContent(record.section, record.slug);
    return NextResponse.json({ record });
  } catch (error) {
    if (error instanceof ContentConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return serverError("Updating content", error);
  }
}

/**
 * DELETE — archives by default, which is reversible and keeps the document.
 * `?purge=1` is the real deletion and additionally requires the site password.
 */
export async function DELETE(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "content:delete", 60);
  if (isResponse(guard)) return guard;

  const { section, slug } = await params;
  const address = parseAddress(section, slug);
  if (!address) return badRequest("Unknown section");

  const purge = new URL(request.url).searchParams.get("purge") === "1";

  try {
    if (!purge) {
      const record = await setContentStatus(address, "archived" as ContentStatus);
      revalidateContent(address.section, address.slug);
      return NextResponse.json({ record, archived: true });
    }

    const reauth = await requireReauth(request);
    if (reauth) return reauth;

    const before = await getContentForAdmin(address.section, address.slug);
    if (before) await saveRevision(before, guard.user.email);

    const deleted = await deleteContent(address);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidateContent(address.section, address.slug);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("Deleting content", error);
  }
}
