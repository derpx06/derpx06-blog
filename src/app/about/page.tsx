import Image from "next/image";
import type { Metadata } from "next";

import { JsonLd } from "@/components/site/JsonLd";
import { Masthead } from "@/components/site/Masthead";
import { NewsletterBlock } from "@/components/site/NewsletterBlock";
import { generateMeta } from "@/lib/metadata";
import { about, achievements, baseURL, person, projects, social } from "@/resources";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: about.title,
    description: about.description,
    baseURL,
    path: about.path,
  });
}

export default function About() {
  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={about.path}
        title={about.title}
        description={about.description}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />

      <Masthead current="about" />

      <div className="ds-split">
        <div className="ds-course-main">
          <span className="ds-kick" style={{ marginBottom: 18 }}>
            About
          </span>
          <h1 className="ds-t-page" style={{ marginBottom: 18, maxWidth: "20ch" }}>
            I build systems and write down what breaks
          </h1>
          <div className="ds-about-intro">{about.intro.description}</div>

          <section className="ds-about-section">
            <span className="ds-kickq">{about.technical.title}</span>
            <div className="ds-two" style={{ gap: "34px 48px" }}>
              {about.technical.skills.map((skill) => (
                <div key={skill.title}>
                  <h2 className="ds-t-m" style={{ marginBottom: 6 }}>
                    {skill.title}
                  </h2>
                  <p className="ds-dek" style={{ fontSize: 14, marginBottom: 10 }}>
                    {skill.description}
                  </p>
                  <div className="ds-chips">
                    {(skill.tags ?? []).map((tag) => (
                      <span key={tag.name} className="ds-chip">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="ds-about-section">
            <span className="ds-kickq">{about.work.title}</span>
            <div className="ds-stack">
              {about.work.experiences.map((role, index) => (
                <div
                  key={`${role.company}-${role.role}`}
                  className={index === 0 ? undefined : "ds-item"}
                  style={{ display: "block", padding: index === 0 ? "0 0 20px" : "20px 0" }}
                >
                  <div className="ds-between" style={{ marginBottom: 8 }}>
                    <h3 className="ds-t-m">
                      {role.role} ·{" "}
                      {role.link ? (
                        <a href={role.link} target="_blank" rel="noopener noreferrer">
                          {role.company}
                        </a>
                      ) : (
                        role.company
                      )}
                    </h3>
                    <span className="ds-meta ds-meta-s">{role.timeframe}</span>
                  </div>
                  <ul className="ds-bullets">
                    {role.achievements.map((line, lineIndex) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed copy, never reordered
                      <li key={lineIndex}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="ds-about-section">
            <span className="ds-kickq">Selected projects</span>
            <div className="ds-stack">
              {projects.map((project, index) => (
                <div
                  key={project.name}
                  className={index === 0 ? undefined : "ds-item"}
                  style={{
                    display: "block",
                    padding: index === 0 ? "0 0 18px" : "18px 0",
                    borderBottom:
                      index === projects.length - 1 ? "1px solid var(--rule-strong)" : undefined,
                  }}
                >
                  <h3 className="ds-t-s" style={{ marginBottom: 4 }}>
                    {project.href ? (
                      <a href={project.href} target="_blank" rel="noopener noreferrer">
                        {project.name} <span aria-hidden="true">↗</span>
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <span className="ds-kick" style={{ marginBottom: 6 }}>
                    {project.stack}
                  </span>
                  <p className="ds-dek" style={{ fontSize: 14 }}>
                    {project.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="ds-about-section">
            <span className="ds-kickq">{about.studies.title}</span>
            <div className="ds-two" style={{ gap: "24px 48px" }}>
              {about.studies.institutions.map((school) => (
                <div key={school.name}>
                  <h3 className="ds-t-m" style={{ marginBottom: 4 }}>
                    {school.name}
                  </h3>
                  <p className="ds-dek" style={{ fontSize: 14 }}>
                    {school.description}
                  </p>
                </div>
              ))}
              <div>
                <h3 className="ds-t-m" style={{ marginBottom: 8 }}>
                  Also
                </h3>
                <ul className="ds-bullets">
                  {achievements.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                          {item.label}
                        </a>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="ds-course-aside ds-sticky-rail ds-about-aside">
          <div className="ds-ph" style={{ height: 200, marginBottom: 14 }}>
            <Image
              src={person.avatar}
              alt={person.name}
              width={600}
              height={720}
              priority
              sizes="(max-width: 1080px) 100vw, 380px"
            />
          </div>
          <span className="ds-meta ds-meta-s" style={{ display: "block", marginBottom: 26 }}>
            {person.role} · {person.location}
          </span>

          <div className="ds-rule" style={{ marginBottom: 26 }} />
          <h2 className="ds-t-l" style={{ marginBottom: 10 }}>
            Say hello
          </h2>
          <p className="ds-dek" style={{ fontSize: 14, marginBottom: 16 }}>
            Open to interesting problems, teaching collaborations, and corrections to anything
            I&apos;ve written.
          </p>
          <div className="ds-stack" style={{ gap: 10 }}>
            <a className="ds-box ds-dark ds-block" href={`mailto:${person.email}`}>
              Email me
            </a>
            {social
              .filter((item) => item.name !== "Email" && item.link)
              .map((item) => (
                <a
                  key={item.name}
                  className="ds-box ds-block"
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              ))}
          </div>
        </aside>
      </div>

      <section className="ds-railband">
        <NewsletterBlock />
      </section>
    </main>
  );
}
