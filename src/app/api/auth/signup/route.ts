import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { clientKey, rateLimit } from "@/lib/auth/rate-limit";
import { createSession } from "@/lib/auth/session";
import { createUser, isValidEmail, normalizeEmail } from "@/lib/auth/users";

export async function POST(request: Request) {
  if (!rateLimit(clientKey(request, "signup"), 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email ?? "");
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "");

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  }

  // Admin rights are an env allowlist over ordinary accounts, and signup is
  // open to anyone — so without this the first person to register an
  // allowlisted address would become an admin. Those accounts are created with
  // `npm run admin:create` instead. The message is deliberately the same one a
  // taken address gets, so this does not disclose who the admins are.
  if (isAdminEmail(email)) {
    return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
  }

  try {
    const user = await createUser({ email, password, name });
    await createSession(user.id);
    return NextResponse.json({ user });
  } catch (error) {
    if ((error as Error).message === "EMAIL_TAKEN") {
      return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
    }
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
