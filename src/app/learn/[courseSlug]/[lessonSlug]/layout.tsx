import { notFound } from "next/navigation";
import { Masthead } from "@/components/site/Masthead";
import { getCourseBySlug } from "@/lib/course-repository";
import CourseMobileControls from "../CourseMobileControls";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const course = await getCourseBySlug(courseSlug);
  if (!course) notFound();

  return (
    <>
      <Masthead current="learn" />
      <CourseMobileControls course={course}>{children}</CourseMobileControls>
    </>
  );
}
