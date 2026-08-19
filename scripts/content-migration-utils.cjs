const SECTION_PATHS = [
  ["blog", /(?:^|[\\/])src[\\/]app[\\/]blog[\\/](?:posts|drafts)[\\/]/],
  ["learn", /(?:^|[\\/])src[\\/]app[\\/]learn[\\/]posts[\\/]/],
  ["explainers", /(?:^|[\\/])src[\\/]app[\\/]explainers[\\/]posts[\\/]/],
  ["work", /(?:^|[\\/])src[\\/]app[\\/]work[\\/]projects[\\/]/],
];

function getSectionFromPath(filePath) {
  const match = SECTION_PATHS.find(([, pattern]) => pattern.test(filePath));
  if (!match) {
    throw new Error(`Unsupported content path: ${filePath}`);
  }
  return match[0];
}

function asArray(value) {
  if (value === undefined || value === null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeMetadata(data = {}) {
  const tagValue = Array.isArray(data.tag) ? data.tag[0] : data.tag;

  return {
    title: typeof data.title === "string" ? data.title : "",
    publishedAt: data.publishedAt || "",
    summary: typeof data.summary === "string" ? data.summary : "",
    image: typeof data.image === "string" ? data.image : "",
    images: asArray(data.images),
    tag: typeof tagValue === "string" ? tagValue : "",
    topics: asArray(data.topics),
    team: asArray(data.team),
    link: typeof data.link === "string" ? data.link : "",
  };
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid content date: ${value}`);
  }
  return date;
}

function toContentDocument({ section, slug, metadata, body, sourcePath, now = new Date() }) {
  if (!section || !slug) throw new Error("Content section and slug are required");

  const normalized = normalizeMetadata(metadata);
  const publishedAt = parseDate(normalized.publishedAt);
  const timestamp = now instanceof Date ? now : new Date(now);

  return {
    section,
    slug,
    title: normalized.title,
    summary: normalized.summary,
    body: typeof body === "string" ? body : "",
    bodyFormat: "mdx",
    status: publishedAt ? "published" : "draft",
    publishedAt,
    createdAt: publishedAt || timestamp,
    updatedAt: timestamp,
    image: normalized.image,
    images: normalized.images,
    tag: normalized.tag,
    topics: normalized.topics,
    team: normalized.team,
    link: normalized.link,
    source: {
      type: "mdx",
      path: sourcePath,
    },
  };
}

function contentKey(content) {
  return `${content.section}:${content.slug}`;
}

module.exports = {
  contentKey,
  getSectionFromPath,
  normalizeMetadata,
  parseDate,
  toContentDocument,
};
