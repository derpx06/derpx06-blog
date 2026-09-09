import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

// Reports live state, so it must never be cached.
export const dynamic = "force-dynamic";

/**
 * Uptime and post-deploy check. Reports whether this instance can actually
 * reach Mongo — the site degrades quietly when it cannot, which is right for
 * readers but means a broken cluster is otherwise invisible.
 *
 * Deliberately says nothing about the cluster beyond reachability: no host, no
 * database name, no error text.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    const { db } = await connectToDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json(
      {
        ok: true,
        db: "up",
        latencyMs: Date.now() - startedAt,
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        checkedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        latencyMs: Date.now() - startedAt,
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
