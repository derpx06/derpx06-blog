function hostnameFromHostHeader(host: string | null | undefined) {
  if (!host) return "";

  const value = host.trim().toLowerCase();
  if (value.startsWith("[")) {
    const closingBracket = value.indexOf("]");
    return closingBracket === -1 ? value : value.slice(1, closingBracket);
  }

  const lastColon = value.lastIndexOf(":");
  const hasOnlyOneColon = lastColon === value.indexOf(":");
  return lastColon > -1 && hasOnlyOneColon ? value.slice(0, lastColon) : value;
}

export function isLocalArticleEditorHost(host: string | null | undefined) {
  const hostname = hostnameFromHostHeader(host).replace(/\.$/, "");
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  if (!local) return false;

  // Belt as well as braces. The Host header is set by the platform router on
  // Vercel, so the check above holds there — but it is one proxy in front of
  // the app away from being attacker-controlled, and this gate stands in front
  // of an unauthenticated content-write API. A production build therefore has
  // to opt in explicitly; a dev machine needs no configuration at all.
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_LOCAL_EDITOR === "1";
}
