import type { Metadata } from "next";

import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { RailBand } from "@/components/site/RailBand";
import { WritingArchive } from "@/components/site/WritingArchive";
import { generateMeta } from "@/lib/metadata";
import { getPieces, tagCounts, toRailCourses } from "@/lib/site-data";
import { getCourses } from "@/lib/course-repository";
import { baseURL, blog, person } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: blog.title,
    description: blog.description,
    baseURL,
    path: blog.path,
  });
}

export default async function Blog() {
  const [pieces, courses] = await Promise.all([getPieces("blog"), getCourses()]);
  const tags = tagCounts(pieces);
  const railCourses = toRailCourses(courses);

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={blog.path}
        title={blog.title}
        description={blog.description}
        author={{ name: person.name, url: `${baseURL}/blog`, image: person.avatar }}
      />

      <Masthead current="writing" />

      <div style={{ padding: "38px var(--gut) 0" }}>
        <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
          Writing
        </h1>
        <p className="ds-dek" style={{ maxWidth: "58ch", marginBottom: 26 }}>
          {pieces.length} {pieces.length === 1 ? "piece" : "pieces"} on the systems I build, the
          models I break and the way I learn. Newest first is rarely the best order — start from a
          tag.
        </p>
      </div>

      <div style={{ padding: "0 var(--gut) 46px" }}>
        <WritingArchive pieces={pieces} tags={tags} />
      </div>

      <RailBand courses={railCourses} />
    </main>
  );
}
