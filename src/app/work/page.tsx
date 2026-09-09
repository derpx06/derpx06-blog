import type { Metadata } from "next";
import Link from "next/link";
import { AdminEdit } from "@/components/site/AdminEdit";
import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { generateMeta } from "@/lib/metadata";
import { formatShortDate, getPieces } from "@/lib/site-data";
import { baseURL, person, work } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: work.title,
    description: work.description,
    baseURL,
    path: work.path,
  });
}

export default async function Work() {
  const projects = await getPieces("work");

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={work.path}
        title={work.title}
        description={work.description}
        author={{ name: person.name, url: `${baseURL}${work.path}`, image: person.avatar }}
      />

      <Masthead current={null} trailing={<AdminEdit href="/admin/content?section=work" />} />

      <div style={{ padding: "38px var(--gut) 20px" }}>
        <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
          Projects
        </h1>
        <p className="ds-dek" style={{ maxWidth: "56ch" }}>
          {work.description}
        </p>
      </div>

      <div className="ds-stack" style={{ padding: "0 var(--gut) 44px" }}>
        {projects.map((project, index) => (
          <article
            key={project.slug}
            className="ds-item"
            style={{
              alignItems: "baseline",
              gap: 16,
              padding: "22px 0",
              borderBottom:
                index === projects.length - 1 ? "1px solid var(--rule-strong)" : undefined,
            }}
          >
            <span className="ds-num" style={{ width: 24 }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="ds-t-m" style={{ marginBottom: 6 }}>
                <Link href={project.href} className="ds-plain-link">
                  {project.title}
                </Link>
              </h2>
              <p className="ds-dek" style={{ fontSize: 14, maxWidth: "62ch" }}>
                {project.summary}
              </p>
            </div>
            <span className="ds-meta ds-meta-s">{formatShortDate(project.publishedAt)}</span>
          </article>
        ))}
      </div>
    </main>
  );
}
