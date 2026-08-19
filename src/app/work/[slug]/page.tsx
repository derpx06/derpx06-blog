import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ScrollToHash } from "@/components";
import { ArticleView } from "@/components/site/ArticleView";
import { JsonLd } from "@/components/site/JsonLd";
import { extractHeadings } from "@/lib/headings";
import { generateMeta } from "@/lib/metadata";
import { getContentBySlug, getContentList } from "@/lib/content-repository";
import { getPieces, relatedTo, toPiece } from "@/lib/site-data";
import { about, baseURL, person, work } from "@/resources";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const projects = await getContentList("work");
  return projects.map((project) => ({ slug: project.slug }));
}

function resolveSlug(slug: string | string[] | undefined) {
  return Array.isArray(slug) ? slug.join("/") : slug || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const project = await getContentBySlug("work", resolveSlug((await params).slug));
  if (!project) return {};

  return generateMeta({
    title: project.metadata.title,
    description: project.metadata.summary,
    baseURL,
    path: `${work.path}/${project.slug}`,
    image: project.metadata.image,
    type: "article",
    publishedTime: project.metadata.publishedAt,
    author: { name: person.name, url: `${baseURL}${about.path}` },
  });
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const slug = resolveSlug((await params).slug);
  const [project, all] = await Promise.all([getContentBySlug("work", slug), getPieces("work")]);
  if (!project) notFound();

  const piece = toPiece(project);
  const related = relatedTo(piece, all, 3);

  return (
    <>
      <JsonLd
        as="article"
        baseURL={baseURL}
        path={`${work.path}/${project.slug}`}
        title={project.metadata.title}
        description={project.metadata.summary}
        datePublished={project.metadata.publishedAt}
        image={project.metadata.image}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />
      <ArticleView
        piece={piece}
        body={project.content}
        headings={extractHeadings(project.content)}
        related={related}
        next={related[0] ?? null}
        sectionLabel="Projects"
        sectionHref="/work"
        startHere={all.filter((item) => item.slug !== piece.slug).slice(0, 3)}
      />
      <ScrollToHash />
    </>
  );
}
