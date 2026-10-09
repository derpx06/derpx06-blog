import fs from "fs";
import path from "path";
import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, blog, person } from "@/resources";
import { getPosts } from "@/utils/utils";
import { formatShortDate, readingTime, tagOf } from "@/lib/article";
import { WritingList } from "@/components/listing/WritingList";
import type { ListItem } from "@/components/listing/WritingList";

export async function generateMetadata() {
  return Meta.generate({
    title: blog.title,
    description: blog.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(blog.title)}`,
    path: blog.path,
  });
}

export default function Blog() {
  const items: ListItem[] = getPosts(["src", "app", "blog", "posts"])
    .sort((a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime())
    .map((p) => ({
      slug: p.slug,
      href: `${blog.path}/${p.slug}`,
      title: p.metadata.title,
      summary: p.metadata.summary,
      date: new Date(p.metadata.publishedAt).toISOString(),
      dateLabel: formatShortDate(p.metadata.publishedAt),
      tag: tagOf(p.metadata),
      topics: p.metadata.topics ?? [],
      minutes: readingTime(p.content),
      image: p.metadata.image && fs.existsSync(path.join(process.cwd(), "public", p.metadata.image)) ? p.metadata.image : null,
      kind: "article" as const,
    }));

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={blog.title}
        description={blog.description}
        path={blog.path}
        image={`/api/og/generate?title=${encodeURIComponent(blog.title)}`}
        author={{ name: person.name, url: `${baseURL}${blog.path}`, image: `${baseURL}${person.avatar}` }}
      />
      <WritingList items={items} />
    </>
  );
}
