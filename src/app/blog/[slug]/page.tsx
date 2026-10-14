import { notFound } from "next/navigation";
import { Meta } from "@once-ui-system/core";
import type { Metadata } from "next";
import { CustomMDX } from "@/components/mdx";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { baseURL, blog } from "@/resources";
import { getPostsHybrid } from "@/utils/utils";
import { extractToc, formatShortDate, readingTime, relatedPosts, tagOf } from "@/lib/article";

const DIR = ["src", "app", "blog", "posts"];
const loadPosts = () => getPostsHybrid(DIR, "blog");

export async function generateStaticParams() {
  return (await loadPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await loadPosts()).find((p) => p.slug === slug);
  if (!post) return {};
  const image = post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`;
  const path = `${blog.path}/${post.slug}`;
  return {
    ...Meta.generate({ title: post.metadata.title, description: post.metadata.summary, baseURL, image, path }),
    alternates: { canonical: `${baseURL}${path}` },
    openGraph: { type: "article", title: post.metadata.title, description: post.metadata.summary, url: `${baseURL}${path}`, images: [image] },
    twitter: { card: "summary_large_image", title: post.metadata.title, description: post.metadata.summary, images: [image] },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = relatedPosts(posts, post).map((r) => ({
    href: `${blog.path}/${r.slug}`,
    title: r.metadata.title,
    meta: [tagOf(r.metadata), formatShortDate(r.metadata.publishedAt)].filter(Boolean).join(" · "),
  }));

  return (
    <ArticleLayout
      kind="article"
      path={`${blog.path}/${post.slug}`}
      title={post.metadata.title}
      summary={post.metadata.summary}
      publishedAt={post.metadata.publishedAt}
      tag={tagOf(post.metadata) || undefined}
      image={post.metadata.image}
      minutes={readingTime(post.content)}
      toc={extractToc(post.content)}
      back={{ href: blog.path, label: "All writing" }}
      related={related}
      sources={post.metadata.sources}
    >
      <CustomMDX source={post.content} />
    </ArticleLayout>
  );
}
