import { checkDocument } from "../../../scripts/check-content.mjs";
import type { ContentRecord, ContentSection } from "@/types/content.types";

/**
 * The editorial rules, surfaced live in the editor and enforced at publish.
 *
 * `checkDocument` is imported from `scripts/check-content.mjs` rather than
 * restated here: it is already pure, it is what `npm run content:check` runs,
 * and two copies of these rules would drift apart within a week.
 *
 * What this adds is severity. The script treats every finding equally because
 * it is a report; the editor needs to know which ones should stop a publish and
 * which are advice.
 */

export type Severity = "error" | "warning";

export type EditorialProblem = {
  rule: string;
  detail: string;
  severity: Severity;
};

/**
 * Rules that block publishing: each is something that renders wrong on the live
 * site with no error anywhere, which is the whole reason the checker exists.
 */
const BLOCKING = new Set(["dropcap", "headings", "image", "prose", "html"]);

/**
 * The `field` rule covers two different kinds of finding, so it cannot be
 * classified by name alone. A wrong *type* is a broken document and blocks; a
 * missing tag or summary is cosmetic — the piece just reads as "Notes", or with
 * a blank dek — and should not stand between a finished draft and publishing.
 */
const BROKEN_FIELD = /is not a string|must be a/i;

function severityFor(rule: string, detail: string): Severity {
  if (rule === "field") return BROKEN_FIELD.test(detail) ? "error" : "warning";
  return BLOCKING.has(rule) ? "error" : "warning";
}

/**
 * Markup that must never reach a page, checked on both body formats.
 *
 * HTML bodies are injected with `dangerouslySetInnerHTML`; MDX bodies are
 * compiled, and raw HTML in MDX v3 becomes real elements. The write path is
 * admin-only, so this is defence in depth rather than the boundary — but it is
 * cheap, and it catches a pasted embed before it becomes a live script tag.
 */
const DANGEROUS: Array<{ pattern: RegExp; detail: string }> = [
  { pattern: /<script[\s>]/i, detail: "<script> is not allowed in a body" },
  { pattern: /<iframe[\s>]/i, detail: "<iframe> is not allowed — use <Media> instead" },
  { pattern: /<object[\s>]|<embed[\s>]/i, detail: "<object>/<embed> are not allowed" },
  { pattern: /\son[a-z]+\s*=/i, detail: "inline event handlers (onclick=…) are not allowed" },
  { pattern: /javascript:/i, detail: "javascript: URLs are not allowed" },
];

export function findDangerousMarkup(body: string): EditorialProblem[] {
  // Fenced code is documentation, not markup that will run.
  const prose = (body || "").replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");

  return DANGEROUS.filter((rule) => rule.pattern.test(prose)).map((rule) => ({
    rule: "html",
    detail: rule.detail,
    severity: "error" as const,
  }));
}

/** The raw-document shape `checkDocument` expects. */
export type CheckableDocument = {
  section: ContentSection;
  slug: string;
  title: string;
  summary: string;
  body: string;
  bodyFormat: string;
  status: string;
  tag: string;
  image: string;
  publishedAt: Date | null;
};

export function toCheckable(record: {
  section: ContentSection;
  slug: string;
  metadata: { title: string; summary: string; tag: string; image: string; publishedAt: string };
  content: string;
  bodyFormat: string;
  status: string;
}): CheckableDocument {
  const published = record.metadata.publishedAt ? new Date(record.metadata.publishedAt) : null;
  return {
    section: record.section,
    slug: record.slug,
    title: record.metadata.title ?? "",
    summary: record.metadata.summary ?? "",
    body: record.content ?? "",
    bodyFormat: record.bodyFormat ?? "mdx",
    status: record.status ?? "draft",
    tag: record.metadata.tag ?? "",
    image: record.metadata.image ?? "",
    publishedAt: published && !Number.isNaN(published.getTime()) ? published : null,
  };
}

/** Runs every rule over a raw document. Safe to call on partial drafts. */
export function checkCheckable(document: CheckableDocument): EditorialProblem[] {
  const problems: EditorialProblem[] = [];

  try {
    for (const problem of checkDocument(document)) {
      problems.push({ ...problem, severity: severityFor(problem.rule, problem.detail) });
    }
  } catch (error) {
    // A half-typed body must never take the editor's linting down with it.
    console.error("Editorial check failed:", error);
  }

  problems.push(...findDangerousMarkup(document.body));
  return problems;
}

export async function checkRecord(record: ContentRecord): Promise<EditorialProblem[]> {
  return checkCheckable(toCheckable(record));
}
