import type { Course } from "@/types/content.types";

export type CourseData = {
  slug: string;
  title: string;
  description: string;
  parts: { title: string; lessons: { slug: string; title: string; href: string }[] }[];
  total: number;
};

/** Serializable shape the learn client components take. Pure: `LearnClient` imports it, so no server-only modules here. */
export function toCourseData(course: Course): CourseData {
  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    parts: course.topics.map((topic) => ({
      title: topic.title,
      lessons: topic.links.map((link) => ({
        slug: link.slug,
        title: link.title,
        href: `/learn/${course.slug}/${link.slug}`,
      })),
    })),
    total: course.topics.reduce((n, topic) => n + topic.links.length, 0),
  };
}

/** Progress summary for one course, from the lesson slugs marked done. */
export function summarize(course: CourseData, done: string[]) {
  const flat = course.parts.flatMap((p) => p.lessons);
  const doneCount = flat.filter((l) => done.includes(l.slug)).length;
  const next = flat.find((l) => !done.includes(l.slug)) ?? null;
  const partsDone = course.parts.filter(
    (p) => p.lessons.length > 0 && p.lessons.every((l) => done.includes(l.slug)),
  ).length;
  return {
    flat,
    doneCount,
    next,
    partsDone,
    pct: flat.length ? Math.round((doneCount / flat.length) * 100) : 0,
    first: flat[0] ?? null,
  };
}
