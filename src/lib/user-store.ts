import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export type SavedKind = "article" | "explainer" | "lesson";
export type SavedItem = { kind: SavedKind; slug: string; title: string; href: string; meta?: string; added: number };

/** Email of the signed-in user, or null. Works in App Router route handlers and server components. */
export async function getSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.email?.toLowerCase() ?? null;
}

export async function getSaved(email: string): Promise<SavedItem[]> {
  const { db } = await connectToDatabase();
  const doc = await db.collection("saved").findOne({ email });
  return (doc?.items as SavedItem[]) ?? [];
}

export async function toggleSaved(email: string, item: Omit<SavedItem, "added">): Promise<SavedItem[]> {
  const items = await getSaved(email);
  const idx = items.findIndex((s) => s.kind === item.kind && s.slug === item.slug);
  const next = idx >= 0 ? items.filter((_, i) => i !== idx) : [{ ...item, added: Date.now() }, ...items];
  const { db } = await connectToDatabase();
  await db.collection("saved").updateOne({ email }, { $set: { email, items: next, updatedAt: new Date() } }, { upsert: true });
  return next;
}

export async function getProgress(email: string, course: string): Promise<string[]> {
  const { db } = await connectToDatabase();
  const doc = await db.collection("progress").findOne({ email, course });
  return (doc?.done as string[]) ?? [];
}

export async function getAllProgress(email: string): Promise<Record<string, string[]>> {
  const { db } = await connectToDatabase();
  const docs = await db.collection("progress").find({ email }).toArray();
  return Object.fromEntries(docs.map((d) => [d.course as string, (d.done as string[]) ?? []]));
}

export async function setLessonDone(email: string, course: string, slug: string, done: boolean): Promise<string[]> {
  const current = await getProgress(email, course);
  const next = done ? Array.from(new Set([...current, slug])) : current.filter((s) => s !== slug);
  const { db } = await connectToDatabase();
  await db.collection("progress").updateOne({ email, course }, { $set: { email, course, done: next, updatedAt: new Date() } }, { upsert: true });
  return next;
}

export async function resetProgress(email: string, course: string): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection("progress").deleteOne({ email, course });
}
