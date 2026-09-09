import { NextResponse } from "next/server";
import { getCourses } from "@/lib/course-repository";
import { courseLessons, getPieces } from "@/lib/site-data";

export type SearchDoc = {
  title: string;
  href: string;
  kind: "Writing" | "Explainer" | "Course" | "Lesson";
  meta: string;
  summary: string;
};

// The index is small and identical for everyone, so cache it at the edge.
export const revalidate = 300;

/** Everything the palette can find, in one payload it fetches once. */
export async function GET() {
  try {
    const [writing, explainers, courses] = await Promise.all([
      getPieces("blog"),
      getPieces("explainers"),
      getCourses(),
    ]);

    const docs: SearchDoc[] = [
      ...writing.map((piece) => ({
        title: piece.title,
        href: piece.href,
        kind: "Writing" as const,
        meta: `${piece.tag} · ${piece.minutes} min`,
        summary: piece.summary ?? "",
      })),
      ...explainers.map((piece) => ({
        title: piece.title,
        href: piece.href,
        kind: "Explainer" as const,
        meta: `${piece.tag} · ${piece.minutes} min`,
        summary: piece.summary ?? "",
      })),
      ...courses.flatMap((course) => [
        {
          title: course.title,
          href: `/learn/${course.slug}`,
          kind: "Course" as const,
          meta: `${courseLessons(course).length} lessons`,
          summary: course.description ?? "",
        },
        ...courseLessons(course).map((lesson) => ({
          title: lesson.title,
          href: `/learn/${course.slug}/${lesson.slug}`,
          kind: "Lesson" as const,
          meta: `${course.title} · ${lesson.topic}`,
          summary: "",
        })),
      ]),
    ];

    return NextResponse.json({ docs });
  } catch (error) {
    console.error("Building the search index failed:", error);
    return NextResponse.json({ docs: [] });
  }
}
