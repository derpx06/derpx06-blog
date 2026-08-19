import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { authenticate } from "@/lib/auth/users";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "login"), 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "");
  const password = String(body?.password ?? "");

  try {
    const user = await authenticate(email, password);
    // One message for both failures so the endpoint cannot enumerate accounts.
    if (!user) {
      return NextResponse.json({ error: "Email or password is wrong." }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Could not sign you in." }, { status: 500 });
  }
}
