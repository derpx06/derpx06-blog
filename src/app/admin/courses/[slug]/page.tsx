import { notFound } from "next/navigation";
import { CourseBuilder } from "@/components/admin/CourseBuilder";
import { getCourseForAdmin, validateCourseReferences } from "@/lib/admin/course-writes";
import { getContentList } from "@/lib/content-repository";

export default async function CourseBuilderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [course, learn] = await Promise.all([getCourseForAdmin(slug), getContentList("learn")]);
  if (!course) notFound();

  const available = learn.map((record) => record.slug).sort();
  const problems = validateCourseReferences(course.topics, new Set(available));

  return (
    <CourseBuilder
      course={{
        slug: course.slug,
        title: course.title,
        description: course.description,
        image: course.image,
        status: course.status,
        topics: course.topics,
      }}
      problems={problems}
      availableLessons={available}
    />
  );
}
