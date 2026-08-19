import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { writeLesson } from "@/lib/reader-state";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const courseSlug = String(body?.courseSlug ?? "");
  const lessonSlug = String(body?.lessonSlug ?? "");
  if (!courseSlug || !lessonSlug) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  await writeLesson(user.id, courseSlug, lessonSlug);
  return NextResponse.json({ ok: true });
}
