import * as cookie from "cookie";
import { NextResponse } from "next/server";
import { PAGE_ACCESS_COOKIE, verifyPageAccessToken } from "@/lib/auth/page-access";

// Reads a cookie, so it must never be cached.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookies = cookie.parse(request.headers.get("cookie") || "");

  if (verifyPageAccessToken(cookies[PAGE_ACCESS_COOKIE])) {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
