import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { writeProgress } from "@/lib/reader-state";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  const percent = Number(body?.percent);
  if (!slug || !Number.isFinite(percent)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  await writeProgress(user.id, {
    slug,
    href: String(body?.href ?? ""),
    title: String(body?.title ?? ""),
    minutes: Number(body?.minutes) || 0,
    percent: Math.min(100, Math.max(0, Math.round(percent))),
  });

  return NextResponse.json({ ok: true });
}
