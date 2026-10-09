import fs from "fs";
import path from "path";
import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, explainers, person } from "@/resources";
import { getPosts } from "@/utils/utils";
import { formatShortDate, readingTime, tagOf } from "@/lib/article";
import { ExplainerList } from "@/components/listing/ExplainerList";
import type { ListItem } from "@/components/listing/WritingList";

export async function generateMetadata() {
  return Meta.generate({
    title: explainers.title,
    description: explainers.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(explainers.title)}`,
    path: explainers.path,
  });
}

export default function Explainers() {
  const items: ListItem[] = getPosts(["src", "app", "explainers", "posts"])
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .map((p) => ({
      slug: p.slug,
      href: `${explainers.path}/${p.slug}`,
      title: p.metadata.title,
      summary: p.metadata.summary,
      date: new Date(p.metadata.publishedAt).toISOString(),
      dateLabel: formatShortDate(p.metadata.publishedAt),
      tag: tagOf(p.metadata),
      topics: p.metadata.topics ?? [],
      minutes: readingTime(p.content),
      image: p.metadata.image && fs.existsSync(path.join(process.cwd(), "public", p.metadata.image)) ? p.metadata.image : null,
      kind: "explainer" as const,
    }));

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={explainers.title}
        description={explainers.description}
        path={explainers.path}
        image={`/api/og/generate?title=${encodeURIComponent(explainers.title)}`}
        author={{ name: person.name, url: `${baseURL}${explainers.path}`, image: `${baseURL}${person.avatar}` }}
      />
      <ExplainerList items={items} />
    </>
  );
}
