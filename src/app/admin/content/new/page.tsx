import { ContentEditor, type EditorRecord } from "@/components/admin/ContentEditor";
import type { ContentSection } from "@/types/content.types";

const SECTIONS: ContentSection[] = ["blog", "explainers", "learn", "work"];

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;

  const blank: EditorRecord = {
    section: SECTIONS.includes(section as ContentSection) ? (section as ContentSection) : "blog",
    slug: "",
    title: "",
    summary: "",
    body: "",
    bodyFormat: "mdx",
    status: "draft",
    tag: "",
    topics: [],
    image: "",
    link: "",
    publishedAt: "",
  };

  return <ContentEditor initial={blank} isNew />;
}
