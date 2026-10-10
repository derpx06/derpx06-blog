import type { Metadata } from "next";
import { LearnClient } from "@/components/learn/LearnClient";
import { toCourseData } from "@/components/learn/course-data";
import { JsonLd } from "@/components/site/JsonLd";
import { getCourses } from "@/lib/course-repository";
import { generateMeta } from "@/lib/metadata";
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
      <LearnClient courses={courses.map(toCourseData)} />
    </main>
  );
}

