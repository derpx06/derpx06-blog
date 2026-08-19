import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { findUserById, type PublicUser } from "./users";

const COOKIE = "reader_session";
const COLLECTION = "sessions";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days

type SessionDocument = {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
};

let indexesReady: Promise<void> | null = null;

async function sessions() {
  const { db } = await connectToDatabase();
  const collection = db.collection<SessionDocument>(COLLECTION);
  indexesReady ||= Promise.all([
    collection.createIndex({ token: 1 }, { unique: true }),
    // Mongo evicts expired sessions for us.
    collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]).then(() => {});
  await indexesReady;
  return collection;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const collection = await sessions();
  await collection.insertOne({
    token,
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + MAX_AGE_SECONDS * 1000),
  });

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) {
    const collection = await sessions();
    await collection.deleteOne({ token });
  }
  store.delete(COOKIE);
}

/**
 * Current reader, or null. Cached per request so a page that asks in three
 * places still costs one round trip. Never throws — a database that is down
 * must render a signed-out site, not a 500.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;

    const collection = await sessions();
    const session = await collection.findOne({ token });
    if (!session || session.expiresAt.getTime() < Date.now()) return null;

    return await findUserById(session.userId);
  } catch (error) {
    console.error("Session lookup failed:", error);
    return null;
  }
});
