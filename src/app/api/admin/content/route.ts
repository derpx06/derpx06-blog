import { NextResponse } from "next/server";
import {
  type ContentWriteInput,
  listContent,
  SECTIONS,
  STATUSES,
  upsertContent,
} from "@/lib/admin/content-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  revalidateContent,
  serverError,
} from "@/lib/admin/route-helpers";
import type { ContentSection, ContentStatus } from "@/types/content.types";

// Reads a session cookie and reports unpublished work; never cache it.
export const dynamic = "force-dynamic";

/** GET /api/admin/content — the listing behind /admin/content and /admin/drafts. */
export async function GET(request: Request) {
  const guard = await guardAdminRequest(request, "content:list", 300);
  if (isResponse(guard)) return guard;

  const params = new URL(request.url).searchParams;
  const section = params.get("section") as ContentSection | null;
  const status = params.get("status") as ContentStatus | null;

  if (section && !SECTIONS.includes(section)) return badRequest("Unknown section");
  if (status && !STATUSES.includes(status)) return badRequest("Unknown status");

  try {
    const result = await listContent({
      section: section ?? undefined,
      status: status ?? undefined,
      search: params.get("search")?.trim() || undefined,
      limit: Number(params.get("limit")) || undefined,
      skip: Number(params.get("skip")) || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return serverError("Listing content", error);
  }
}

/** POST /api/admin/content — create. Updates go to the [section]/[slug] route. */
export async function POST(request: Request) {
  const guard = await guardAdminRequest(request, "content:create", 60);
  if (isResponse(guard)) return guard;

  const body = await readJson<ContentWriteInput>(request);
  if (!body) return badRequest("Expected a JSON body");
  if (!body.title?.trim()) return badRequest("A title is required");
  if (!SECTIONS.includes(body.section)) return badRequest("Unknown section");
  if (body.status && !STATUSES.includes(body.status)) return badRequest("Unknown status");

  try {
    const record = await upsertContent(body);
    revalidateContent(record.section, record.slug);
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    return serverError("Creating content", error);
  }
}
