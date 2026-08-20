import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CourseRail } from "@/components/site/CourseRail";
import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { RailBand } from "@/components/site/RailBand";
import { ReadingQueue } from "@/components/site/ReadingQueue";
import { ResumeStrip } from "@/components/site/ResumeStrip";
import { SaveButton } from "@/components/site/SaveButton";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { formatShortDate, getSiteSummary, tagCounts, toRailCourses } from "@/lib/site-data";
import { about, baseURL, home, person, routes } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: home.title,
    description: home.description,
    baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  const { writing, explainers, courses } = await getSiteSummary();

  const [lead, ...rest] = writing;
  const listed = rest.slice(0, 4);
  const startHere = [...writing].sort((a, b) => b.minutes - a.minutes).slice(0, 4);
  const archiveTags = tagCounts([...writing, ...explainers]);
  const [leadExplainer, ...moreExplainers] = explainers;
  const railCourses = toRailCourses(courses);

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />

      <Masthead current={null} />

      <p className="ds-meta ds-home-counts">
        {writing.length} {writing.length === 1 ? "piece" : "pieces"} · {explainers.length}{" "}
        {explainers.length === 1 ? "explainer" : "explainers"} · {courses.length}{" "}
        {courses.length === 1 ? "course" : "courses"} · written by one developer, in public
      </p>

      <ResumeStrip />

      <div className="ds-main-rail" style={{ padding: "40px var(--gut) 44px" }}>
        <div>
          <span className="ds-kickq" style={{ marginBottom: 22 }}>
            Latest writing
          </span>

          {lead ? (
            <article style={{ paddingBottom: 30, borderBottom: "1px solid var(--rule)" }}>
              <span className="ds-kick" style={{ marginBottom: 10 }}>
                {lead.tag} · {lead.minutes} min · {formatShortDate(lead.publishedAt)}
              </span>
              <h2 className="ds-t-lead" style={{ marginBottom: 12, maxWidth: "24ch" }}>
                <Link href={lead.href} className="ds-plain-link">
                  {lead.title}
                </Link>
              </h2>
              <p className="ds-dek" style={{ fontSize: 17, maxWidth: "56ch", marginBottom: 16 }}>
                {lead.summary}
              </p>
              <div className="ds-row">
                <Link href={lead.href} className="ds-box ds-dark">
                  Read
                </Link>
                <SaveButton
                  piece={{
                    slug: lead.slug,
                    href: lead.href,
                    title: lead.title,
                    minutes: lead.minutes,
                  }}
                />
              </div>
            </article>
          ) : (
            <p className="ds-dek">Nothing published yet.</p>
          )}

          {listed.length > 0 && (
            <div className="ds-stack">
              {listed.map((piece, index) => (
                <div
                  key={piece.slug}
                  style={{
                    display: "flex",
                    gap: 26,
                    padding: "22px 0",
                    borderBottom:
                      index === listed.length - 1
                        ? "1px solid var(--rule-strong)"
                        : "1px solid var(--rule)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="ds-t-m" style={{ marginBottom: 7 }}>
                      <Link href={piece.href} className="ds-plain-link">
                        {piece.title}
                      </Link>
                    </h3>
                    <p className="ds-dek" style={{ fontSize: 14, maxWidth: "52ch" }}>
                      {piece.summary}
                    </p>
                  </div>
                  <div style={{ width: 110, flex: "none", textAlign: "right" }}>
                    <span className="ds-kick" style={{ marginBottom: 6 }}>
                      {piece.tag}
                    </span>
                    <span className="ds-meta ds-meta-s">{piece.minutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {writing.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <Link href="/blog" className="ds-box">
                All {writing.length} {writing.length === 1 ? "piece" : "pieces"}
              </Link>
            </div>
          )}
        </div>

        <aside className="ds-stack" style={{ gap: 36 }}>
          {startHere.length > 0 && (
            <div>
              <span className="ds-kickq" style={{ marginBottom: 18 }}>
                Start here
              </span>
              <div className="ds-stack" style={{ gap: 16 }}>
                {startHere.map((piece, index) => (
                  <div key={piece.slug} style={{ display: "flex", gap: 12 }}>
                    <span className="ds-num" style={{ width: 16, fontSize: 13 }}>
                      {index + 1}
                    </span>
                    <div>
                      <Link href={piece.href} className="ds-t-xs ds-plain-link">
                        {piece.title}
                      </Link>
                      <span
                        className="ds-meta ds-meta-s"
                        style={{ display: "block", marginTop: 5 }}
                      >
                        {piece.minutes} min · {piece.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {routes["/learn"] && <CourseRail courses={railCourses} compact />}
        </aside>
      </div>

      {routes["/explainers"] && leadExplainer && (
        <section
          className="ds-tint"
          style={{
            borderTop: "1px solid var(--rule)",
            borderBottom: "1px solid var(--rule)",
            padding: "36px var(--gut) 40px",
          }}
        >
          <div className="ds-between" style={{ marginBottom: 24 }}>
            <h2 className="ds-t-l">Explainers — drawn, not written</h2>
            <Link href="/explainers" className="ds-box">
              All {explainers.length}
            </Link>
          </div>
          <div className="ds-three">
            {[leadExplainer, ...moreExplainers].slice(0, 3).map((piece) => {
              const image = resolveImage(piece.image);
              return (
                <article key={piece.slug}>
                  <Link href={piece.href} className="ds-plain-link">
                    {image && (
                      <div className="ds-ph ds-ph-fit" style={{ height: 150, marginBottom: 14 }}>
                        <Image
                          src={image}
                          alt=""
                          width={360}
                          height={150}
                          sizes="(max-width: 760px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <span className="ds-kick" style={{ marginBottom: 7 }}>
                      {piece.tag} · {piece.minutes} min
                    </span>
                    <h3 className="ds-t-s">{piece.title}</h3>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="ds-main-rail" style={{ padding: "38px var(--gut) 44px" }}>
        <div>
          <span className="ds-kickq" style={{ marginBottom: 18 }}>
            Browse the archive
          </span>
          <div className="ds-wrap">
            {archiveTags.map(({ tag, count }) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`} className="ds-box">
                {tag} {count}
              </Link>
            ))}
          </div>
        </div>
        <ReadingQueue />
      </div>

      <RailBand courses={railCourses} />
    </main>
  );
}
