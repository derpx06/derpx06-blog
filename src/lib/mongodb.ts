import { MongoClient, type Db } from "mongodb";

type MongoCache = {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ client: MongoClient; db: Db }> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  __derpx06Mongo?: MongoCache;
};

const cache: MongoCache = globalForMongo.__derpx06Mongo || {
  client: null,
  db: null,
  promise: null,
};

globalForMongo.__derpx06Mongo = cache;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || "";
  if (!uri) throw new Error("MONGODB_URI is not set in environment");

  if (cache.client && cache.db) {
    return { client: cache.client, db: cache.db };
  }

  if (cache.promise) {
    return cache.promise;
  }

  // Serverless defaults: a small pool per instance, and a fast, clear failure
  // instead of a function that hangs until the platform kills it.
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
    socketTimeoutMS: 20_000,
    retryWrites: true,
    retryReads: true,
  });
  cache.promise = client
    .connect()
    .then(() => {
      const dbName = process.env.MONGODB_DB || "derpx06";
      const db = client.db(dbName);

      cache.client = client;
      cache.db = db;
      cache.promise = null;
      return { client, db };
    })
    .catch((error) => {
      cache.promise = null;
      throw error;
    });

  return cache.promise;
}
