import { NextResponse } from "next/server";
import {
  type CourseWriteInput,
  listCoursesForAdmin,
  reorderCourses,
  upsertCourse,
} from "@/lib/admin/course-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  revalidateCourses,
  serverError,
} from "@/lib/admin/route-helpers";

export const dynamic = "force-dynamic";

const STATUSES = ["draft", "published", "archived"];

/** GET — every course at every status, including drafts. */
export async function GET(request: Request) {
  const guard = await guardAdminRequest(request, "courses:list", 300);
  if (isResponse(guard)) return guard;

  try {
    return NextResponse.json({ items: await listCoursesForAdmin() });
  } catch (error) {
    return serverError("Listing courses", error);
  }
}

/** POST — create a course. It starts as a draft with no topics. */
export async function POST(request: Request) {
  const guard = await guardAdminRequest(request, "courses:create", 60);
  if (isResponse(guard)) return guard;

  const body = await readJson<CourseWriteInput>(request);
  if (!body?.title?.trim()) return badRequest("A title is required");
  if (body.status && !STATUSES.includes(body.status)) return badRequest("Unknown status");

  try {
    const course = await upsertCourse(body);
    revalidateCourses(course.slug);
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return serverError("Creating a course", error);
  }
}

/** PATCH — reorder the rail. Body is the full list of slugs, top to bottom. */
export async function PATCH(request: Request) {
  const guard = await guardAdminRequest(request, "courses:reorder", 120);
  if (isResponse(guard)) return guard;

  const body = await readJson<{ slugs: string[] }>(request);
  if (!Array.isArray(body?.slugs)) return badRequest("Expected { slugs: string[] }");

  try {
    await reorderCourses(body.slugs);
    revalidateCourses();
    return NextResponse.json({ items: await listCoursesForAdmin() });
  } catch (error) {
    return serverError("Reordering courses", error);
  }
}
