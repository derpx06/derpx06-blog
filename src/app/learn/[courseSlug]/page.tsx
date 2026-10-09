import { notFound } from "next/navigation";
import { Meta } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL, learn } from "@/resources";
import { courses } from "@/resources/courses";
import { courseBySlug, flatLessons, outlineOf } from "@/lib/courses";
import { CourseClient } from "@/components/learn/CourseClient";

export async function generateStaticParams() {
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ courseSlug: string }> }): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = courseBySlug(courseSlug);
  if (!course) return {};
  return Meta.generate({
    title: course.title,
    description: course.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(course.title)}`,
    path: `${learn.path}/${course.slug}`,
  });
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const course = courseBySlug(courseSlug);
  if (!course) notFound();

  const data = { slug: course.slug, title: course.title, description: course.description, parts: outlineOf(course), total: flatLessons(course).length };
  const others = courses.filter((c) => c.slug !== course.slug).map((c) => ({ slug: c.slug, title: c.title, total: flatLessons(c).length }));
  return <CourseClient course={data} others={others} />;
}
