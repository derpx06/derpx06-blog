type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Per-key fixed window. In-memory, so it is per instance — enough to blunt
 * credential stuffing against a single-box deploy.
 *
 * ponytail: in-memory counter. Move to Redis if this ever runs multi-instance.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [entryKey, entry] of buckets) if (entry.resetAt <= now) buckets.delete(entryKey);
  }
  return bucket.count <= limit;
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0].trim() || "local";
  return `${scope}:${ip}`;
}
