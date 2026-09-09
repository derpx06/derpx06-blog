import { NextResponse } from "next/server";
import { getContentList } from "@/lib/content-repository";
import {
  type CourseWriteInput,
  deleteCourse,
  getCourseForAdmin,
  setCourseStatus,
  upsertCourse,
  validateCourseReferences,
  writeTopics,
} from "@/lib/admin/course-writes";
import {
  badRequest,
  guardAdminRequest,
  isResponse,
  readJson,
  requireReauth,
  revalidateCourses,
  serverError,
} from "@/lib/admin/route-helpers";
import type { CourseStatus, CourseTopic } from "@/types/content.types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

const STATUSES: CourseStatus[] = ["draft", "published", "archived"];

/** The `learn` slugs a lesson may point at — anything else 404s on the site. */
async function publishedLearnSlugs(): Promise<Set<string>> {
  const records = await getContentList("learn");
  return new Set(records.map((record) => record.slug));
}

/** GET — one course, with its referential problems already resolved. */
export async function GET(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "courses:read", 300);
  if (isResponse(guard)) return guard;

  const { slug } = await params;

  try {
    const course = await getCourseForAdmin(slug);
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const available = await publishedLearnSlugs();
    return NextResponse.json({
      course,
      problems: validateCourseReferences(course.topics, available),
      availableLessons: [...available].sort(),
    });
  } catch (error) {
    return serverError("Reading a course", error);
  }
}

type PatchBody = Partial<CourseWriteInput> & {
  topics?: CourseTopic[];
  status?: CourseStatus;
};

/**
 * PATCH — update metadata, replace the topic tree, or change status.
 *
 * Topics arrive as the whole array because lesson order *is* array order; there
 * is no position field to update in place.
 */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "courses:write", 240);
  if (isResponse(guard)) return guard;

  const { slug } = await params;
  const body = await readJson<PatchBody>(request);
  if (!body) return badRequest("Expected a JSON body");
  if (body.status && !STATUSES.includes(body.status)) return badRequest("Unknown status");

  try {
    const existing = await getCourseForAdmin(slug);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let course = existing;

    if (body.topics) {
      course = await writeTopics(slug, body.topics);
    }

    if (body.title || body.description !== undefined || body.image !== undefined) {
      course = await upsertCourse({
        slug,
        title: body.title ?? course.title,
        description: body.description ?? course.description,
        image: body.image ?? course.image,
        topics: course.topics,
        status: course.status,
        order: course.order,
      });
    }

    if (body.status && body.status !== course.status) {
      course = await setCourseStatus(slug, body.status);
    }

    revalidateCourses(slug);

    const available = await publishedLearnSlugs();
    return NextResponse.json({
      course,
      problems: validateCourseReferences(course.topics, available),
    });
  } catch (error) {
    return serverError("Updating a course", error);
  }
}

/**
 * DELETE — archives by default, so a mis-click is recoverable. `?purge=1` is the
 * real deletion and additionally requires the site password.
 */
export async function DELETE(request: Request, { params }: Params) {
  const guard = await guardAdminRequest(request, "courses:delete", 40);
  if (isResponse(guard)) return guard;

  const { slug } = await params;
  const purge = new URL(request.url).searchParams.get("purge") === "1";

  try {
    if (!purge) {
      const course = await setCourseStatus(slug, "archived");
      revalidateCourses(slug);
      return NextResponse.json({ course, archived: true });
    }

    const reauth = await requireReauth(request);
    if (reauth) return reauth;

    const deleted = await deleteCourse(slug);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    revalidateCourses(slug);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("Deleting a course", error);
  }
}
