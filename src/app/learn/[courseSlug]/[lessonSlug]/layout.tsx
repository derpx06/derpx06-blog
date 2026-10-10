import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/course-repository";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  if (!(await getCourseBySlug(courseSlug))) notFound();
  return children;
}
