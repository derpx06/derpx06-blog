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
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}
