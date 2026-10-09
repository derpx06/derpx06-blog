import { notFound } from "next/navigation";
import { courseBySlug } from "@/lib/courses";

export default async function CourseLayout({ children, params }: { children: React.ReactNode; params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  if (!courseBySlug(courseSlug)) notFound();
  return children;
}
