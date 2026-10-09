import { Meta } from "@once-ui-system/core";
import { baseURL, learn } from "@/resources";
import { courses } from "@/resources/courses";
import { flatLessons, outlineOf } from "@/lib/courses";
import { LearnClient } from "@/components/learn/LearnClient";

export async function generateMetadata() {
  return Meta.generate({
    title: learn.title,
    description: learn.description,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(learn.title)}`,
    path: learn.path,
  });
}

export default function Learn() {
  const data = courses.map((c) => ({ slug: c.slug, title: c.title, description: c.description, parts: outlineOf(c), total: flatLessons(c).length }));
  return <LearnClient courses={data} />;
}
