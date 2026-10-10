import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleLayout } from "@/components/article/ArticleLayout";
import { AdminEdit } from "@/components/site/AdminEdit";
import { ArticleBody } from "@/components/site/ArticleBody";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkLessonRead } from "@/components/site/MarkLessonRead";
import { getContentBySlugs } from "@/lib/content-repository";
import { getCourseBySlug, getCourses } from "@/lib/course-repository";
import { extractHeadings } from "@/lib/headings";
import { generateMeta } from "@/lib/metadata";
import { courseLessons, readingMinutes } from "@/lib/site-data";
import { about, baseURL, person } from "@/resources";

const getContentBySlugsCached = cache(getContentBySlugs);

// Deliberately NOT `dynamicParams = false`: Mongo is the source of truth, and
// pinning the param set meant a lesson added after the build 404'd at the
// router until the next deploy. Unknown slugs render on demand; the three
// notFound() calls below still handle a genuinely missing lesson.
export const revalidate = 300;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.flatMap((course) =>
    course.topics.flatMap((topic) =>
      topic.links.map((link) => ({ courseSlug: course.slug, lessonSlug: link.slug })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) return {};

  const link = courseLessons(course).find((item) => item.slug === lessonSlug);
  if (!link) return {};

  const post = (await getContentBySlugsCached("learn", [link.postSlugs[0]]))[0];
  if (!post) return {};

  return generateMeta({
    title: `${link.title} | ${course.title}`,
    description: post.metadata.summary,
    baseURL,
    path: `/learn/${courseSlug}/${lessonSlug}`,
    image: post.metadata.image,
    type: "article",
    publishedTime: post.metadata.publishedAt,
    author: { name: person.name, url: `${baseURL}${about.path}` },
  });
}

export default async function CourseLesson({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  const lessons = courseLessons(course);
  const index = lessons.findIndex((item) => item.slug === lessonSlug);
  const link = lessons[index];
  if (!link) notFound();

  const posts = await getContentBySlugsCached("learn", link.postSlugs);
  const primary = posts[0];
  if (!primary) notFound();

  const href = `/learn/${courseSlug}/${lessonSlug}`;
  const lessonHref = (slug: string) => `/learn/${courseSlug}/${slug}`;
  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;
  const partIndex = course.topics.findIndex((topic) => topic.title === link.topic);

  const body = posts.map((post) => post.content).join("\n\n");
  const headings = extractHeadings(body);
  const minutes = readingMinutes(body);

  return (
    <>
      <JsonLd
        as="techArticle"
        baseURL={baseURL}
        path={href}
        title={link.title}
        description={primary.metadata.summary}
        datePublished={primary.metadata.publishedAt}
        image={primary.metadata.image}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />
      <MarkLessonRead courseSlug={courseSlug} lessonSlug={lessonSlug} />

      <ArticleLayout
        piece={{
          slug: `${courseSlug}/${lessonSlug}`,
          href,
          title: link.title,
          minutes,
          tag: `${course.title} · Part ${partIndex + 1}`,
        }}
        summary={primary.metadata.summary}
        publishedAt={primary.metadata.publishedAt}
        toc={headings}
        back={{ href: `/learn/${courseSlug}`, label: "Syllabus" }}
        lesson={{
          course: { slug: course.slug, title: course.title },
          parts: course.topics.map((topic) => ({
            title: topic.title,
            lessons: topic.links.map((item) => ({
              slug: item.slug,
              title: item.title,
              href: lessonHref(item.slug),
            })),
          })),
          partIndex,
          partTitle: link.topic,
          slug: lessonSlug,
          index,
          total: lessons.length,
          prev: previous && { href: lessonHref(previous.slug), title: previous.title },
          next: next && { href: lessonHref(next.slug), title: next.title },
        }}
      >
        {posts.map((post) => (
          <div key={post.slug}>
            <AdminEdit
              href={`/admin/content/learn/${post.slug}`}
              label={`Edit ${post.slug}`}
              variant="mini"
            />
            <ArticleBody body={post.content} bodyFormat={post.bodyFormat} />
          </div>
        ))}
      </ArticleLayout>
    </>
  );
}
