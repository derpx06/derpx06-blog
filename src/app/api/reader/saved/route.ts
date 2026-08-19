import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { writeSaved } from "@/lib/reader-state";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  if (!slug) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  await writeSaved(
    user.id,
    {
      slug,
      href: String(body?.href ?? ""),
      title: String(body?.title ?? ""),
      minutes: Number(body?.minutes) || 0,
    },
    Boolean(body?.saved),
  );

  return NextResponse.json({ ok: true });
}
