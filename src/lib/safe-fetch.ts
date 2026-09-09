import dns from "node:dns/promises";
import net from "node:net";

/**
 * Guard for the two endpoints that fetch a caller-supplied URL. Without this a
 * request to /api/og/* is a server-side request forgery: the function runs
 * inside the deploy's network, so `http://169.254.169.254/` or an internal
 * hostname would be fetched and echoed back to the caller.
 *
 * The check is scheme + resolved-address based rather than a string blocklist,
 * because a hostname can resolve to a private address and a redirect can leave
 * the origin entirely — hence `redirect: "error"` below.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 5000;

function isPrivateAddress(address: string): boolean {
  const version = net.isIP(address);

  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 || // this network
      a === 10 || // private
      a === 127 || // loopback
      (a === 169 && b === 254) || // link-local, incl. the cloud metadata endpoint
      (a === 172 && b >= 16 && b <= 31) || // private
      (a === 192 && b === 168) || // private
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      a >= 224 // multicast and reserved
    );
  }

  if (version === 6) {
    const value = address.toLowerCase();
    if (value === "::" || value === "::1") return true;
    // Unique-local (fc00::/7) and link-local (fe80::/10).
    if (/^f[cd]/.test(value) || /^fe[89ab]/.test(value)) return true;
    // IPv4-mapped: re-check the embedded address.
    const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(value);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }

  // Not an IP literal at all — treat as unsafe rather than guess.
  return true;
}

/** `URL.hostname` keeps the brackets on an IPv6 literal; `net.isIP` does not. */
function bareHostname(url: URL): string {
  const host = url.hostname;
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
}

export type SafeUrlResult = { ok: true; url: URL } | { ok: false; reason: string };

/** Parses and vets a caller-supplied URL. Exported so it can be unit tested. */
export function parseSafeUrl(input: string | null | undefined): SafeUrlResult {
  if (!input) return { ok: false, reason: "A url parameter is required" };

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "Not a valid absolute URL" };
  }

  if (url.protocol !== "https:") return { ok: false, reason: "Only https URLs are allowed" };
  if (url.username || url.password) return { ok: false, reason: "Credentials are not allowed" };

  // An IP literal never needs resolving, so reject the private ones up front.
  const hostname = bareHostname(url);
  if (net.isIP(hostname) && isPrivateAddress(hostname)) {
    return { ok: false, reason: "That address is not routable from here" };
  }

  return { ok: true, url };
}

/** Every address the hostname resolves to must be public, not just the first. */
async function resolvesToPublicAddress(hostname: string): Promise<boolean> {
  if (net.isIP(hostname)) return !isPrivateAddress(hostname);

  try {
    const records = await dns.lookup(hostname, { all: true });
    return records.length > 0 && records.every((record) => !isPrivateAddress(record.address));
  } catch {
    return false;
  }
}

export type SafeFetchResult =
  | { ok: true; response: Response; body: ArrayBuffer }
  | { ok: false; status: number; reason: string };

/**
 * Fetches a vetted URL with a timeout, a size cap and redirects refused —
 * a redirect is the standard way past an origin check, so it fails instead.
 */
export async function safeFetch(input: string | null | undefined): Promise<SafeFetchResult> {
  const parsed = parseSafeUrl(input);
  if (!parsed.ok) return { ok: false, status: 400, reason: parsed.reason };

  if (!(await resolvesToPublicAddress(bareHostname(parsed.url)))) {
    return { ok: false, status: 400, reason: "That host is not routable from here" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(parsed.url, {
      signal: controller.signal,
      redirect: "error",
      headers: { "User-Agent": "derpx06-link-preview" },
    });

    if (!response.ok) {
      return { ok: false, status: 502, reason: `Upstream responded ${response.status}` };
    }

    const declared = Number(response.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) {
      return { ok: false, status: 413, reason: "Upstream response is too large" };
    }

    const body = await response.arrayBuffer();
    if (body.byteLength > MAX_BYTES) {
      return { ok: false, status: 413, reason: "Upstream response is too large" };
    }

    return { ok: true, response, body };
  } catch {
    return { ok: false, status: 502, reason: "Could not fetch that URL" };
  } finally {
    clearTimeout(timeout);
  }
}
