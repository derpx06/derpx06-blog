import { notFound } from "next/navigation";
import { Meta } from "@once-ui-system/core";
import type { Metadata } from "next";
import { cache } from "react";
import { CustomMDX } from "@/components/mdx";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import { baseURL } from "@/resources";
import { courses } from "@/resources/courses";
import { getPosts } from "@/utils/utils";
import { extractToc, readingTime } from "@/lib/article";
import { courseBySlug, flatLessons, outlineOf, partName } from "@/lib/courses";

const getPostsCached = cache(getPosts);
const DIR = ["src", "app", "learn", "posts"];

export const dynamicParams = false;

export async function generateStaticParams() {
  return courses.flatMap((c) => flatLessons(c).map((l) => ({ courseSlug: c.slug, lessonSlug: l.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const course = courseBySlug(courseSlug);
  const lesson = course && flatLessons(course).find((l) => l.slug === lessonSlug);
  if (!course || !lesson) return {};
  const post = getPostsCached(DIR).find((p) => p.slug === lesson.postSlugs[0]);
  if (!post) return {};
  const title = `${lesson.title} | ${course.title}`;
  const path = `/learn/${courseSlug}/${lessonSlug}`;
  const image = post.metadata.image || `/api/og/generate?title=${encodeURIComponent(lesson.title)}`;
  return {
    ...Meta.generate({ title, description: post.metadata.summary, baseURL, image, path }),
    alternates: { canonical: `${baseURL}${path}` },
    openGraph: { type: "article", title, description: post.metadata.summary, url: `${baseURL}${path}`, images: [image] },
    twitter: { card: "summary_large_image", title, description: post.metadata.summary, images: [image] },
  };
}

export default async function Lesson({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const course = courseBySlug(courseSlug);
  if (!course) notFound();
  const all = flatLessons(course);
  const lesson = all.find((l) => l.slug === lessonSlug);
  if (!lesson) notFound();

  const posts = getPostsCached(DIR);
  const lessonPosts = lesson.postSlugs.map((s) => posts.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => !!p);
  if (lessonPosts.length === 0) notFound();
  const source = lessonPosts.map((p) => p.content).join("\n\n");
  const primary = lessonPosts[0];
  const prev = all[lesson.index - 1] ?? null;
  const next = all[lesson.index + 1] ?? null;

  return (
    <ArticleLayout
      kind="lesson"
      path={lesson.href}
      title={lesson.title}
      summary={primary.metadata.summary}
      publishedAt={primary.metadata.publishedAt}
      tag={`${course.title} · Part ${lesson.partIndex + 1}`}
      minutes={readingTime(source)}
      toc={extractToc(source)}
      back={{ href: `/learn/${course.slug}`, label: "Syllabus" }}
      lesson={{
        course: { slug: course.slug, title: course.title },
        parts: outlineOf(course),
        partIndex: lesson.partIndex,
        partTitle: partName(lesson.partTitle),
        slug: lesson.slug,
        index: lesson.index,
        total: all.length,
        prev: prev && { href: prev.href, title: prev.title },
        next: next && { href: next.href, title: next.title },
      }}
    >
      {lessonPosts.map((p) => <CustomMDX key={p.slug} source={p.content} />)}
    </ArticleLayout>
  );
}
