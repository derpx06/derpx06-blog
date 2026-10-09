import { courses, type Course } from "@/resources/courses";

export type FlatLesson = { slug: string; title: string; href: string; postSlugs: string[]; partIndex: number; partTitle: string; index: number };

export function courseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function flatLessons(course: Course): FlatLesson[] {
  let i = 0;
  return course.topics.flatMap((t, pi) =>
    t.links.map((l) => ({ slug: l.slug, title: l.title, href: `/learn/${course.slug}/${l.slug}`, postSlugs: l.postSlugs, partIndex: pi, partTitle: t.title, index: i++ })),
  );
}

/** "1. Strategy & Roadmap" → "Strategy & Roadmap" */
export const partName = (title: string) => title.replace(/^\d+\.\s*/, "");

export function outlineOf(course: Course) {
  return course.topics.map((t) => ({ title: partName(t.title), lessons: t.links.map((l) => ({ slug: l.slug, title: l.title, href: `/learn/${course.slug}/${l.slug}` })) }));
}
