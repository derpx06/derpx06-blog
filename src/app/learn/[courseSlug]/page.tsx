import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseClient } from "@/components/learn/CourseClient";
import { toCourseData } from "@/components/learn/course-data";
import { JsonLd } from "@/components/site/JsonLd";
import { getCourseBySlug, getCourses } from "@/lib/course-repository";
import { generateMeta } from "@/lib/metadata";
import { courseLessonCount } from "@/lib/site-data";
import { baseURL, person } from "@/resources";

export const revalidate = 300;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ courseSlug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const course = await getCourseBySlug((await params).courseSlug);
  if (!course) return {};

  return generateMeta({
    title: course.title,
    description: course.description,
    baseURL,
    path: `/learn/${course.slug}`,
    image: course.image,
  });
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const [course, courses] = await Promise.all([getCourseBySlug(courseSlug), getCourses()]);
  if (!course) notFound();

  const others = courses
    .filter((item) => item.slug !== course.slug)
    .map((item) => ({ slug: item.slug, title: item.title, total: courseLessonCount(item) }));

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={`/learn/${course.slug}`}
        title={course.title}
        description={course.description}
        image={course.image}
        author={{ name: person.name, url: `${baseURL}/learn`, image: person.avatar }}
      />
      <CourseClient course={toCourseData(course)} others={others} />
    </main>
  );
}

