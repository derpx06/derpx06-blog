import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { EMPTY_STATE, getReaderState } from "@/lib/reader-state";

// Per-reader and cookie-dependent: never cache this at the edge.
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ signedIn: false, user: null, ...EMPTY_STATE });

  const state = await getReaderState();
  return NextResponse.json({ signedIn: true, user, ...state });
}
