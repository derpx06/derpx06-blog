import { NextResponse } from "next/server";
import { courses } from "@/resources/courses";
import { getAllProgress, getProgress, getSessionEmail, resetProgress, setLessonDone } from "@/lib/user-store";

const courseSlugs = new Set(courses.map((c) => c.slug));
const lessonSlugs = new Set(courses.flatMap((c) => c.topics.flatMap((t) => t.links.map((l) => `${c.slug}/${l.slug}`))));

export async function GET(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ done: [] }, { status: 401 });
  const course = new URL(req.url).searchParams.get("course");
  try {
    if (course) {
      if (!courseSlugs.has(course)) return NextResponse.json({ message: "Unknown course" }, { status: 400 });
      return NextResponse.json({ done: await getProgress(email, course) });
    }
    return NextResponse.json({ all: await getAllProgress(email) });
  } catch (e) {
    console.error("progress GET", e);
    return NextResponse.json({ message: "Storage unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ message: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const course = body?.course;
  if (!courseSlugs.has(course)) return NextResponse.json({ message: "Unknown course" }, { status: 400 });
  try {
    if (body.reset === true) {
      await resetProgress(email, course);
      return NextResponse.json({ done: [] });
    }
    const slug = body?.slug;
    if (typeof slug !== "string" || !lessonSlugs.has(`${course}/${slug}`)) return NextResponse.json({ message: "Unknown lesson" }, { status: 400 });
    return NextResponse.json({ done: await setLessonDone(email, course, slug, body.done !== false) });
  } catch (e) {
    console.error("progress POST", e);
    return NextResponse.json({ message: "Storage unavailable" }, { status: 503 });
  }
}
