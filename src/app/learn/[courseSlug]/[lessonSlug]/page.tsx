import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { CustomMDX } from "@/components";
import { ArticleContents } from "@/components/site/ArticleContents";
import { JsonLd } from "@/components/site/JsonLd";
import { MarkLessonRead } from "@/components/site/MarkLessonRead";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { getContentBySlugs } from "@/lib/content-repository";
import { getCourseBySlug, getCourses } from "@/lib/course-repository";
import { extractHeadings } from "@/lib/headings";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { courseLessons, readingMinutes } from "@/lib/site-data";
import { about, baseURL, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";

const getContentBySlugsCached = cache(getContentBySlugs);

export const dynamicParams = false;
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

  const previous = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  const body = posts.map((post) => post.content).join("\n\n");
  const headings = extractHeadings(body);
  const minutes = readingMinutes(body);
  const hero = resolveImage(primary.metadata.image);

  return (
    <>
      <JsonLd
        as="techArticle"
        baseURL={baseURL}
        path={`/learn/${courseSlug}/${lessonSlug}`}
        title={link.title}
        description={primary.metadata.summary}
        datePublished={primary.metadata.publishedAt}
        image={primary.metadata.image}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />
      <ScrollProgress
        piece={{
          slug: `${courseSlug}/${lessonSlug}`,
          href: `/learn/${courseSlug}/${lessonSlug}`,
          title: link.title,
          minutes,
          tag: course.title,
        }}
      />
      <MarkLessonRead courseSlug={courseSlug} lessonSlug={lessonSlug} />

      <div className="ds-lesson-grid">
        <article id="main" className="ds-lesson-article">
          <span className="ds-kick" style={{ marginBottom: 14 }}>
            {link.topic} · lesson {index + 1} of {lessons.length} · {minutes} min
            {primary.metadata.publishedAt ? ` · ${formatDate(primary.metadata.publishedAt)}` : ""}
          </span>
          <h1 className="ds-t-hero" style={{ marginBottom: 18 }}>
            {link.title}
          </h1>
          {primary.metadata.summary && (
            <p className="ds-dek" style={{ fontSize: 18, marginBottom: 22, color: "var(--ink)" }}>
              {primary.metadata.summary}
            </p>
          )}

          {hero && (
            <figure className="ds-figure">
              <Image
                src={hero}
                alt=""
                width={1200}
                height={630}
                priority
                sizes="(max-width: 1024px) 100vw, 700px"
                style={{ width: "100%", height: "auto" }}
              />
            </figure>
          )}

          <div className="ds-prose">
            {posts.map((post) => (
              <CustomMDX key={post.slug} source={post.content} />
            ))}
          </div>

          <nav className="ds-lesson-pager" aria-label="Lesson navigation">
            {previous ? (
              <Link href={`/learn/${courseSlug}/${previous.slug}`} className="ds-box">
                ← {previous.title}
              </Link>
            ) : (
              <Link href={`/learn/${courseSlug}`} className="ds-box">
                ← Course overview
              </Link>
            )}
            {next && (
              <Link href={`/learn/${courseSlug}/${next.slug}`} className="ds-box ds-dark">
                {next.title} →
              </Link>
            )}
          </nav>
        </article>

        {headings.length > 0 && (
          <aside className="ds-lesson-toc">
            <span className="ds-kickq" style={{ marginBottom: 16 }}>
              Contents
            </span>
            <ArticleContents headings={headings} />
          </aside>
        )}
      </div>
    </>
  );
}
