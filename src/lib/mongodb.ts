import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
// Cache the promise, not the result, so concurrent callers share one client instead of racing to open several.
let cached: Promise<{ client: MongoClient; db: Db }> | null = null;

export function connectToDatabase() {
  if (!uri) return Promise.reject(new Error("MONGODB_URI is not set in environment"));
  cached ??= (async () => {
    // Fail fast so a Mongo outage degrades pages to MDX-only instead of hanging them for 30s.
    const client = await new MongoClient(uri, { serverSelectionTimeoutMS: 5000 }).connect();
    const db = client.db(process.env.MONGODB_DB || "derpx06");
    await db.collection("articles").createIndex({ section: 1, slug: 1 }, { unique: true })
      .catch((e) => console.error("Could not ensure articles index:", e));
    return { client, db };
  })().catch((e) => { cached = null; throw e; }); // let the next request retry
  return cached;
}
