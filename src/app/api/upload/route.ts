import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/auth/admin";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";
import { headers } from "next/headers";

const MAX_BYTES = 8 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

async function uploadToCloudinary(file: File): Promise<string> {
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: "derpx06" });
  return result.secure_url;
}

async function uploadToDisk(file: File, extension: string): Promise<string> {
  // A serverless filesystem is ephemeral: the file would be written, returned,
  // and gone by the next request. Better to refuse than to lose it silently.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Set CLOUDINARY_* to upload images from a deployed environment");
  }

  const name = `${Date.now()}-${randomBytes(4).toString("hex")}${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

/**
 * Editor image uploads. Cloudinary when it is configured, otherwise the local
 * public/uploads directory — the editor is localhost-only either way.
 */
export async function POST(request: Request) {
  // Either an authenticated admin, or the legacy localhost editor. Identity is
  // the real gate now; the host check stays so the local TipTap editor keeps
  // working without an account.
  const guard = await adminGuard();
  if (!guard.ok) {
    const requestHeaders = await headers();
    if (!isLocalArticleEditorHost(requestHeaders.get("host"))) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file received" }, { status: 400 });
  }

  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json({ message: `Unsupported file type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Image is larger than 8 MB" }, { status: 413 });
  }

  try {
    const url = cloudinaryConfigured()
      ? await uploadToCloudinary(file)
      : await uploadToDisk(file, extension);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ message: "Could not store the image" }, { status: 500 });
  }
}
