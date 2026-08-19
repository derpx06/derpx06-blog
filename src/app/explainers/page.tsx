import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { RailBand } from "@/components/site/RailBand";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { getCourses } from "@/lib/course-repository";
import { getPieces, tagCounts, toRailCourses } from "@/lib/site-data";
import { baseURL, explainers, person } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: explainers.title,
    description: explainers.description,
    baseURL,
    path: explainers.path,
  });
}

export default async function Explainers() {
  const [pieces, courses] = await Promise.all([getPieces("explainers"), getCourses()]);
  const [lead, ...rest] = pieces;
  const leadImage = resolveImage(lead?.image);
  const tags = tagCounts(pieces);
  const railCourses = toRailCourses(courses);

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={explainers.path}
        title={explainers.title}
        description={explainers.description}
        author={{ name: person.name, url: `${baseURL}/explainers`, image: person.avatar }}
      />

      <Masthead current="explainers" />

      <div className="ds-explainer-head">
        <div>
          <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
            Explainers
          </h1>
          <p className="ds-dek" style={{ maxWidth: "44ch", marginBottom: 20 }}>
            {pieces.length} {pieces.length === 1 ? "thing" : "things"} I only understood after
            drawing them. Each one is a single idea, one diagram, and as few words as I could
            manage.
          </p>
          <div className="ds-wrap">
            <span className="ds-box ds-dark">All {pieces.length}</span>
            {tags.map((entry) => (
              <span key={entry.tag} className="ds-box">
                {entry.tag} {entry.count}
              </span>
            ))}
          </div>
        </div>

        {lead && (
          <article>
            <Link href={lead.href} className="ds-plain-link">
              <div className="ds-ph ds-ph-fit" style={{ height: 250, marginBottom: 16 }}>
                {leadImage ? (
                  <Image
                    src={leadImage}
                    alt=""
                    width={720}
                    height={250}
                    priority
                    sizes="(max-width: 1080px) 100vw, 600px"
                  />
                ) : (
                  "diagram"
                )}
              </div>
              <span className="ds-kick" style={{ marginBottom: 8 }}>
                {lead.tag} · {lead.minutes} min
              </span>
              <h2 className="ds-t-xl" style={{ marginBottom: 8 }}>
                {lead.title}
              </h2>
            </Link>
            <p className="ds-dek" style={{ fontSize: 15 }}>
              {lead.summary}
            </p>
          </article>
        )}
      </div>

      {rest.length > 0 && (
        <>
          <div className="ds-rule2" style={{ marginInline: "var(--gut)" }} />
          <div className="ds-two" style={{ padding: "30px var(--gut) 44px" }}>
            {rest.map((piece) => {
              const image = resolveImage(piece.image);
              return (
              <article key={piece.slug} className="ds-plate">
                <Link href={piece.href} className="ds-ph ds-plate-media">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      width={340}
                      height={260}
                      sizes="170px"
                    />
                  ) : (
                    "diagram"
                  )}
                </Link>
                <div style={{ minWidth: 0 }}>
                  <span className="ds-kick" style={{ marginBottom: 8 }}>
                    {piece.tag} · {piece.minutes} min
                  </span>
                  <h3 className="ds-t-m" style={{ marginBottom: 8 }}>
                    <Link href={piece.href} className="ds-plain-link">
                      {piece.title}
                    </Link>
                  </h3>
                  <p className="ds-dek" style={{ fontSize: 14 }}>
                    {piece.summary}
                  </p>
                </div>
              </article>
              );
            })}
          </div>
        </>
      )}

      <RailBand courses={railCourses} />
    </main>
  );
}
