import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealFx, Schema, Meta } from "@once-ui-system/core";
import { home, about, person, baseURL, routes } from "@/resources";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import Post from "@/components/blog/Post";
import { courses } from "@/resources/courses";
import styles from "./home.module.scss";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL,
    path: home.path,
    image: home.image,
  });
}

const stats = [
  ["210K+", "People reached"],
  ["4×", "Hackathon winner"],
  ["2", "Production mobile apps"],
  ["3", "Core engineering domains"],
];

type HomeSectionProps = {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  children: ReactNode;
};

function HomeSection({ index, eyebrow, title, copy, href, children }: HomeSectionProps) {
  return (
    <RevealFx translateY="8" fillWidth>
      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <p className={styles.sectionIndex}>{index}</p>
          <div>
            <p className={styles.kicker}>{eyebrow}</p>
            <h2>{title}</h2>
            <p>{copy}</p>
          </div>
          <Link className={styles.sectionLink} href={href}>
            View all <ArrowUpRight size={15} />
          </Link>
        </header>
        {children}
      </section>
    </RevealFx>
  );
}

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true" />

      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <section className={styles.hero}>
        <RevealFx translateY="8" fillWidth>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Software engineer · Pune, India</p>
            <h1>
              I build useful software from <span>idea to production.</span>
            </h1>
            <p className={styles.heroLead}>
              Production mobile products, dependable backend systems, and practical AI agents—built with ownership,
              clarity, and attention to the details people actually feel.
            </p>

            <div className={styles.heroActions}>
              {routes["/learn"] && (
                <Link className={styles.primaryAction} href="/learn">
                  Explore my work <ArrowUpRight size={16} />
                </Link>
              )}
              <Link className={styles.secondaryAction} href={about.path}>
                About me
              </Link>
            </div>

            <div className={styles.heroNote}>
              <span className={styles.statusDot} />
              Available for meaningful engineering work and ambitious collaborations.
            </div>
          </div>
        </RevealFx>
      </section>

      <RevealFx translateY="8" fillWidth>
        <section className={styles.stats} aria-label="Career highlights">
          {stats.map(([value, label]) => (
            <article className={styles.stat} key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </section>
      </RevealFx>

      {routes["/learn"] && (
        <HomeSection
          index="01"
          eyebrow="Latest courses"
          title="Practical learning built around real systems."
          copy="Focused lessons for developers who want to understand the architecture, trade-offs, and implementation—not only copy code."
          href="/learn"
        >
          <div className={styles.courseGrid}>
            {courses.slice(0, 4).map((course) => (
              <Post
                key={course.id}
                post={{
                  slug: course.slug,
                  metadata: {
                    title: course.title,
                    summary: course.description,
                    image: course.image,
                    publishedAt: "2024-01-01",
                  },
                  content: "",
                }}
                thumbnail
                pathPrefix="learn"
                direction="column"
                variant="home"
              />
            ))}
          </div>
        </HomeSection>
      )}

      {routes["/explainers"] && (
        <HomeSection
          index="02"
          eyebrow="Selected explainers"
          title="Complex engineering ideas, made understandable."
          copy="Visual, first-principles explanations of AI systems, infrastructure, research, and the decisions behind modern software."
          href="/explainers"
        >
          <Posts
            range={[1, 4]}
            columns="2"
            thumbnail
            direction="column"
            source={["src", "app", "explainers", "posts"]}
            pathPrefix="explainers"
            variant="home"
          />
        </HomeSection>
      )}

      {routes["/blog"] && (
        <HomeSection
          index="03"
          eyebrow="Recent writing"
          title="Notes from building, researching, and experimenting."
          copy="Engineering observations, research breakdowns, practical guides, and lessons collected while turning ideas into working products."
          href="/blog"
        >
          <Posts range={[1, 6]} columns="3" thumbnail direction="column" variant="home" />
        </HomeSection>
      )}

      <RevealFx translateY="8" fillWidth>
        <section className={styles.finalCta}>
          <div>
            <p className={styles.sectionIndex}>Stay curious</p>
            <h2>Useful engineering ideas, without the noise.</h2>
            <p>
              Follow new explainers, practical courses, and notes about mobile, backend, and AI systems as they are
              published.
            </p>
            <Link href={about.path}>
              More about me <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className={styles.newsletter}>
            <Mailchimp />
          </div>
        </section>
      </RevealFx>
    </main>
  );
}
