import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ScrollToHash } from "@/components";
import { ArticleView } from "@/components/site/ArticleView";
import { JsonLd } from "@/components/site/JsonLd";
import { getContentBySlug, getContentList } from "@/lib/content-repository";
import { extractHeadings } from "@/lib/headings";
import { generateMeta } from "@/lib/metadata";
import { getPieces, relatedTo, toPiece } from "@/lib/site-data";
import { about, baseURL, explainers, person } from "@/resources";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getContentList("explainers");
  return posts.map((post) => ({ slug: post.slug }));
}

function resolveSlug(slug: string | string[] | undefined) {
  return Array.isArray(slug) ? slug.join("/") : slug || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const post = await getContentBySlug("explainers", resolveSlug((await params).slug));
  if (!post) return {};

  return generateMeta({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL,
    path: `${explainers.path}/${post.slug}`,
    image: post.metadata.image,
    type: "article",
    publishedTime: post.metadata.publishedAt,
    author: { name: person.name, url: `${baseURL}${about.path}` },
  });
}

export default async function Explainer({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const slug = resolveSlug((await params).slug);
  const [post, all] = await Promise.all([
    getContentBySlug("explainers", slug),
    getPieces("explainers"),
  ]);
  if (!post) notFound();

  const piece = toPiece(post);
  const related = relatedTo(piece, all, 3);
  const index = all.findIndex((item) => item.slug === piece.slug);
  const next = all[index + 1] ?? related[0] ?? null;
  const startHere = all.filter((item) => item.slug !== piece.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        as="techArticle"
        baseURL={baseURL}
        path={`${explainers.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        image={post.metadata.image}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />
      <ArticleView
        piece={piece}
        body={post.content}
        bodyFormat={post.bodyFormat}
        headings={extractHeadings(post.content)}
        related={related}
        next={next}
        sectionHref="/explainers"
        startHere={startHere}
      />
      <ScrollToHash />
    </>
  );
}
