import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminEdit } from "@/components/site/AdminEdit";
import { CourseProgressHeader } from "@/components/site/CourseProgressHeader";
import { CourseSyllabus } from "@/components/site/CourseSyllabus";
import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { RailBand } from "@/components/site/RailBand";
import { getCourseBySlug, getCourses } from "@/lib/course-repository";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { courseLessonCount, courseLessons, toRailCourses } from "@/lib/site-data";
import { baseURL, person } from "@/resources";

export const revalidate = 300;

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ courseSlug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const course = await getCourseBySlug((await params).courseSlug);
  if (!course) return {};

  return generateMeta({
    title: course.title,
    description: course.description,
    baseURL,
    path: `/learn/${course.slug}`,
    image: course.image,
  });
}

export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const [course, courses] = await Promise.all([getCourseBySlug(courseSlug), getCourses()]);
  if (!course) notFound();

  const lessons = courseLessons(course);
  const lessonCount = courseLessonCount(course);
  const parts = course.topics.map((topic) => ({
    title: topic.title,
    lessons: topic.links.map((link) => ({ slug: link.slug, title: link.title })),
  }));

  const cover = resolveImage(course.image);
  const others = courses.filter((item) => item.slug !== course.slug);
  const railCourses = toRailCourses(courses);

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={`/learn/${course.slug}`}
        title={course.title}
        description={course.description}
        image={course.image}
        author={{ name: person.name, url: `${baseURL}/learn`, image: person.avatar }}
      />

      <Masthead current="learn" trailing={<AdminEdit href={`/admin/courses/${courseSlug}`} />} />

      <div className="ds-split">
        <div className="ds-course-main">
          <span className="ds-kick" style={{ marginBottom: 16 }}>
            Course · free · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
          </span>
          <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
            {course.title}
          </h1>
          <p className="ds-dek" style={{ fontSize: 18, maxWidth: "52ch", marginBottom: 22 }}>
            {course.description}
          </p>

          <CourseProgressHeader
            courseSlug={course.slug}
            lessons={lessons.map((lesson) => ({ slug: lesson.slug }))}
          />

          <span className="ds-kickq" style={{ marginBottom: 16 }}>
            Syllabus
          </span>
          <CourseSyllabus courseSlug={course.slug} parts={parts} />
        </div>

        <aside className="ds-course-aside ds-sticky-rail">
          {cover && (
            <div className="ds-ph ds-ph-fit" style={{ height: 180, marginBottom: 24 }}>
              <Image
                src={cover}
                alt=""
                width={600}
                height={360}
                priority
                sizes="(max-width: 1080px) 100vw, 380px"
              />
            </div>
          )}

          <span className="ds-kickq" style={{ marginBottom: 12 }}>
            What's inside
          </span>
          <div
            className="ds-stack"
            style={{
              gap: 9,
              font: "400 14px/1.4 var(--ds-sans)",
              color: "var(--body)",
              marginBottom: 26,
            }}
          >
            {course.topics.map((topic) => (
              <span key={topic.title}>{topic.title}</span>
            ))}
          </div>

          {others.length > 0 && (
            <>
              <div className="ds-rule" style={{ marginBottom: 26 }} />
              <span className="ds-kickq" style={{ marginBottom: 12 }}>
                Other courses
              </span>
              <div className="ds-stack">
                {others.map((item, index) => (
                  <div
                    key={item.id}
                    className={index === 0 ? undefined : "ds-item"}
                    style={{ padding: index === 0 ? "0 0 14px" : "14px 0", display: "block" }}
                  >
                    <Link href={`/learn/${item.slug}`} className="ds-t-s ds-plain-link">
                      {item.title}
                    </Link>
                    <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 5 }}>
                      {courseLessonCount(item)} lessons
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      <RailBand courses={railCourses} />
    </main>
  );
}
