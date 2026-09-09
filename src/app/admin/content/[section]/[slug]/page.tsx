import { notFound } from "next/navigation";
import { ContentEditor, type EditorRecord } from "@/components/admin/ContentEditor";
import { getContentForAdmin, SECTIONS } from "@/lib/admin/content-writes";
import type { ContentSection } from "@/types/content.types";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  if (!SECTIONS.includes(section as ContentSection)) notFound();

  const record = await getContentForAdmin(section as ContentSection, slug);
  if (!record) notFound();

  const initial: EditorRecord = {
    section: record.section,
    slug: record.slug,
    title: record.metadata.title,
    summary: record.metadata.summary,
    body: record.content,
    bodyFormat: record.bodyFormat,
    status: record.status,
    tag: record.metadata.tag,
    topics: record.metadata.topics ?? [],
    image: record.metadata.image,
    link: record.metadata.link ?? "",
    publishedAt: record.metadata.publishedAt,
  };

  return <ContentEditor initial={initial} />;
}
