import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminEdit } from "@/components/site/AdminEdit";
import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { RailBand } from "@/components/site/RailBand";
import { getCourses } from "@/lib/course-repository";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { courseLessonCount, toRailCourses } from "@/lib/site-data";
import { baseURL, learn, person } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: learn.title,
    description: learn.description,
    baseURL,
    path: learn.path,
  });
}

export default async function Learn() {
  const courses = await getCourses();
  const railCourses = toRailCourses(courses);

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={learn.path}
        title={learn.title}
        description={learn.description}
        author={{ name: person.name, url: `${baseURL}/learn`, image: person.avatar }}
      />

      <Masthead current="learn" trailing={<AdminEdit href="/admin/courses" />} />

      <div style={{ padding: "38px var(--gut) 26px" }}>
        <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
          Learn
        </h1>
        <p className="ds-dek" style={{ maxWidth: "56ch" }}>
          {courses.length} {courses.length === 1 ? "course" : "courses"}, each a sequence of short
          lessons you can work through in order. Free, no video, no sign-up needed to read.
        </p>
      </div>

      <div className="ds-stack" style={{ padding: "0 var(--gut) 44px" }}>
        {courses.map((course, index) => {
          const lessons = courseLessonCount(course);
          const cover = resolveImage(course.image);
          return (
            <article
              key={course.id}
              className="ds-item ds-course-row"
              style={{
                borderBottom:
                  index === courses.length - 1 ? "1px solid var(--rule-strong)" : undefined,
              }}
            >
              <span className="ds-num" style={{ width: 24 }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="ds-t-m" style={{ marginBottom: 7 }}>
                  <Link href={`/learn/${course.slug}`} className="ds-plain-link">
                    {course.title}
                  </Link>
                </h2>
                <p className="ds-dek" style={{ fontSize: 14, maxWidth: "62ch" }}>
                  {course.description}
                </p>
                <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 8 }}>
                  {lessons} {lessons === 1 ? "lesson" : "lessons"} · {course.topics.length}{" "}
                  {course.topics.length === 1 ? "part" : "parts"} · free
                </span>
              </div>
              {cover && (
                <Link href={`/learn/${course.slug}`} className="ds-ph ds-course-cover">
                  <Image src={cover} alt="" width={340} height={200} sizes="170px" />
                </Link>
              )}
            </article>
          );
        })}
      </div>

      <RailBand courses={railCourses} />
    </main>
  );
}
