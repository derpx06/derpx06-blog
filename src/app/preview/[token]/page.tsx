import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/site/ArticleView";
import { getContentForAdmin } from "@/lib/admin/content-writes";
import { verifyPreviewToken } from "@/lib/admin/preview-token";
import { extractHeadings } from "@/lib/headings";
import { toPiece } from "@/lib/site-data";

// The token is the whole authorisation; nothing here may be cached or indexed.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false, nocache: true },
};

const LABELS: Record<string, { label: string; href: string }> = {
  blog: { label: "Writing", href: "/blog" },
  explainers: { label: "Explainers", href: "/explainers" },
  work: { label: "Work", href: "/work" },
  learn: { label: "Learn", href: "/learn" },
};

/**
 * Renders an unpublished draft through the real article template, so what the
 * editor sees before publishing is what readers get afterwards.
 *
 * Authorisation is the signed token alone — deliberately, so a preview link can
 * be opened on a phone or sent to someone without an account. It names one
 * document and expires after 30 minutes.
 */
export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const target = verifyPreviewToken(token);
  if (!target) notFound();

  const record = await getContentForAdmin(target.section, target.slug);
  if (!record) notFound();

  const piece = toPiece(record);
  const section = LABELS[record.section] ?? LABELS.blog;

  return (
    <>
      <div
        style={{
          padding: "10px var(--gut)",
          background: "var(--tint)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <span className="ds-meta ds-meta-s">
          Preview — {record.status}, not live. This link expires in 30 minutes.{" "}
          <Link href={`/admin/content/${record.section}/${record.slug}`}>Back to the editor</Link>
        </span>
      </div>
      <ArticleView
        piece={piece}
        body={record.content}
        bodyFormat={record.bodyFormat}
        headings={extractHeadings(record.content)}
        related={[]}
        next={null}
        sectionHref={section.href}
        startHere={[]}
      />
    </>
  );
}
