export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** POST a file to /api/upload (Cloudinary) and resolve with its public URL. */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`Image is over ${MAX_IMAGE_BYTES / 1024 / 1024}MB`);
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.message || "Upload failed");
  return data.url as string;
}
