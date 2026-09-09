import * as cookie from "cookie";
import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/auth/rate-limit";
import {
  issuePageAccessToken,
  PAGE_ACCESS_COOKIE,
  PAGE_ACCESS_MAX_AGE_SECONDS,
  safeEqual,
} from "@/lib/auth/page-access";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "page-access"), 20, 15 * 60 * 1000)) {
    return NextResponse.json({ message: "Too many attempts. Try again later." }, { status: 429 });
  }

  const correctPassword = process.env.PAGE_ACCESS_PASSWORD;
  if (!correctPassword) {
    console.error("PAGE_ACCESS_PASSWORD is not set");
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const password = String(body?.password ?? "");

  if (!safeEqual(password, correctPassword)) {
    return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
  }

  const token = issuePageAccessToken();
  if (!token) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.headers.set(
    "Set-Cookie",
    cookie.serialize(PAGE_ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: PAGE_ACCESS_MAX_AGE_SECONDS,
      sameSite: "strict",
      path: "/",
    }),
  );

  return response;
}
