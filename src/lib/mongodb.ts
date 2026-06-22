import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (!uri) throw new Error("MONGODB_URI is not set in environment");

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const dbName = process.env.MONGODB_DB || "derpx06";
  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}
