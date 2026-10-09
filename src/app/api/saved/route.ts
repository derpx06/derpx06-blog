import { NextResponse } from "next/server";
import { getSaved, getSessionEmail, toggleSaved, type SavedKind } from "@/lib/user-store";

const KINDS: SavedKind[] = ["article", "explainer", "lesson"];

export async function GET() {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ items: [] }, { status: 401 });
  try {
    return NextResponse.json({ items: await getSaved(email) });
  } catch (e) {
    console.error("saved GET", e);
    return NextResponse.json({ message: "Storage unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return NextResponse.json({ message: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const item = body?.item;
  if (!item || !KINDS.includes(item.kind) || typeof item.slug !== "string" || typeof item.title !== "string" || typeof item.href !== "string" || !item.href.startsWith("/")) {
    return NextResponse.json({ message: "Bad item" }, { status: 400 });
  }
  try {
    const items = await toggleSaved(email, {
      kind: item.kind,
      slug: item.slug.slice(0, 200),
      title: item.title.slice(0, 300),
      href: item.href.slice(0, 300),
      meta: typeof item.meta === "string" ? item.meta.slice(0, 100) : undefined,
    });
    return NextResponse.json({ items });
  } catch (e) {
    console.error("saved POST", e);
    return NextResponse.json({ message: "Storage unavailable" }, { status: 503 });
  }
}
