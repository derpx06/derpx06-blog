import { courses } from "@/resources/courses";
import { notFound, redirect } from "next/navigation";

export async function generateStaticParams() {
    return courses.map(course => ({
        courseSlug: course.slug,
    }));
}

export default async function CoursePage({
    params,
}: {
    params: Promise<{ courseSlug: string }>;
}) {
    const { courseSlug } = await params;
    const course = courses.find(c => c.slug === courseSlug);
    if (!course) notFound();

    const firstLesson = course.topics?.[0]?.links?.[0];
    if (!firstLesson) notFound();

    redirect(`/learn/${course.slug}/${firstLesson.slug}`);
}
