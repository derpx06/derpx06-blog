import { courses } from "@/resources/courses";
import { notFound } from "next/navigation";
import CourseMobileControls from "./CourseMobileControls";

export default async function CourseLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseSlug: string }>;
}) {
    const { courseSlug } = await params;
    const course = courses.find(c => c.slug === courseSlug);
    if (!course) notFound();

    return (
        <CourseMobileControls course={course}>
            {children}
        </CourseMobileControls>
    );
}
