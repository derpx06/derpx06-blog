import { getContentList } from "@/lib/content-repository";
import { getCourses } from "@/lib/course-repository";
import type { Course } from "@/types/content.types";
import type { ContentSection } from "@/types/content.types";
import { toPiece, type Piece } from "./pieces";

export {
  formatLongDate,
  formatShortDate,
  groupByYear,
  readingMinutes,
  relatedTo,
  tagCounts,
  toPiece,
  type Piece,
} from "./pieces";

/** Published pieces for a section, newest first, with read times resolved. */
export async function getPieces(section: ContentSection): Promise<Piece[]> {
  const records = await getContentList(section, { includeBody: true });
  return records.filter((record) => record.status === "published").map(toPiece);
}

export function courseLessonCount(course: Course): number {
  return course.topics.reduce((total, topic) => total + topic.links.length, 0);
}

export function courseLessons(course: Course) {
  return course.topics.flatMap((topic) =>
    topic.links.map((link) => ({ ...link, topic: topic.title })),
  );
}

/** Shape a course list for the rails, which only need slugs and lesson order. */
export function toRailCourses(courses: Course[]) {
  return courses.map((course) => ({
    slug: course.slug,
    title: course.title,
    lessonCount: courseLessonCount(course),
    lessons: courseLessons(course).map((lesson) => ({ slug: lesson.slug, title: lesson.title })),
  }));
}

export type SiteSummary = {
  writing: Piece[];
  explainers: Piece[];
  courses: Course[];
};

/** One read of everything the home page's rails and counters need. */
export async function getSiteSummary(): Promise<SiteSummary> {
  const [writing, explainers, courses] = await Promise.all([
    getPieces("blog"),
    getPieces("explainers"),
    getCourses(),
  ]);
  return { writing, explainers, courses };
}
