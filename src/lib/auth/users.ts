import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "./passwords";

export type UserDocument = {
  _id: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
};

export type PublicUser = { id: string; email: string; name: string };

const COLLECTION = "users";

let indexesReady: Promise<void> | null = null;

async function users() {
  const { db } = await connectToDatabase();
  const collection = db.collection<UserDocument>(COLLECTION);
  // One index build per process, not per call.
  indexesReady ||= collection.createIndex({ email: 1 }, { unique: true }).then(() => {});
  await indexesReady;
  return collection;
}

export function normalizeEmail(email: string) {
  return (email || "").trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function toPublicUser(user: UserDocument): PublicUser {
  return { id: user._id.toHexString(), email: user.email, name: user.name };
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}): Promise<PublicUser> {
  const collection = await users();
  const email = normalizeEmail(input.email);
  const document: UserDocument = {
    _id: new ObjectId(),
    email,
    name: input.name.trim() || email.split("@")[0],
    passwordHash: await hashPassword(input.password),
    createdAt: new Date(),
  };

  try {
    await collection.insertOne(document);
  } catch (error) {
    // 11000 = duplicate key: the unique email index did its job.
    if ((error as { code?: number }).code === 11000) {
      throw new Error("EMAIL_TAKEN");
    }
    throw error;
  }

  return toPublicUser(document);
}

export async function authenticate(email: string, password: string): Promise<PublicUser | null> {
  const collection = await users();
  const user = await collection.findOne({ email: normalizeEmail(email) });
  if (!user) return null;
  return (await verifyPassword(password, user.passwordHash)) ? toPublicUser(user) : null;
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await users();
  const user = await collection.findOne({ _id: new ObjectId(id) });
  return user ? toPublicUser(user) : null;
}
