import type { Metadata } from "next";
import { type ListItem, WritingList } from "@/components/listing/WritingList";
import { JsonLd } from "@/components/site/JsonLd";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { getPieces } from "@/lib/site-data";
import { baseURL, blog, person } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: blog.title,
    description: blog.description,
    baseURL,
    path: blog.path,
  });
}

export default async function Blog() {
  const items: ListItem[] = (await getPieces("blog")).map((piece) => ({
    ...piece,
    image: resolveImage(piece.image),
  }));

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={blog.path}
        title={blog.title}
        description={blog.description}
        author={{ name: person.name, url: `${baseURL}/blog`, image: person.avatar }}
      />
      <WritingList items={items} adminHref="/admin/content?section=blog" />
    </main>
  );
}
