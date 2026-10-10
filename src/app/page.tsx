import Link from "next/link";
import { Meta, Schema } from "@once-ui-system/core";
import { baseURL, home, about, person } from "@/resources";
import { courses } from "@/resources/courses";
import { getPosts } from "@/utils/utils";
import { formatShortDate, readingTime, tagOf } from "@/lib/article";
import { partName } from "@/lib/courses";
import { HeroFx } from "@/components/site/HeroFx";
import { Icon } from "@/components/site/icons";
import { SaveButton } from "@/components/article/ArticleReader";
import { CopyEmail, HomeHero } from "./HomeHero";
import s from "./home.module.scss";

export async function generateMetadata() {
  return Meta.generate({ title: home.title, description: home.description, baseURL, path: home.path, image: home.image });
}

const GITHUB = "https://github.com/derpx06";
const MAX_PARTS = 5;

type Kind = "article" | "explainer";
const SOURCES: { kind: Kind; label: string; base: string; dir: string[] }[] = [
  { kind: "article", label: "Essay", base: "/blog", dir: ["src", "app", "blog", "posts"] },
  { kind: "explainer", label: "Explainer", base: "/explainers", dir: ["src", "app", "explainers", "posts"] },
];

function latest(n: number) {
  return SOURCES.flatMap(({ kind, label, base, dir }) =>
    getPosts(dir).map((p) => ({
      kind,
      label,
      slug: p.slug,
      href: `${base}/${p.slug}`,
      title: p.metadata.title,
      summary: p.metadata.summary,
      tag: tagOf(p.metadata),
      date: p.metadata.publishedAt,
      time: new Date(p.metadata.publishedAt).getTime() || 0,
      mins: readingTime(p.content),
    })),
  )
    .sort((a, b) => b.time - a.time)
    .slice(0, n);
}

export default function Home() {
  const posts = latest(4);
  const newest = posts[0];

  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: `${baseURL}${person.avatar}` }}
      />

      <HeroFx className={`hero ${s.hero}`}>
        <div className={s.heroBg} aria-hidden="true">
          <div className={s.glow} />
          <div className={s.spot} />
          <div className={s.dots} />
          <div className={s.dotsHot} />
        </div>
        <div className="heroFade" aria-hidden="true" />
        <HomeHero newest={newest} />
      </HeroFx>

      <div className="wrap">
        <section className={s.section} aria-labelledby="latest">
          <div className={s.head}>
            <div className={s.headCopy}>
              <span className="eyebrow">01 · Latest</span>
              <h2 id="latest" className="h2">Latest writing</h2>
              <p className="lede">Essays argue one point. Explainers walk through one paper. Both are written after I got it wrong at least once.</p>
            </div>
            <div className={s.headLinks}>
              <Link href="/blog">All writing →</Link>
              <Link href="/explainers">All explainers →</Link>
            </div>
          </div>
          <div className={s.rows}>
            {posts.map((p) => (
              <div key={p.href} className={s.row}>
                <Link href={p.href} className={s.rowLink}>
                  <span className="eyebrow">{p.label}{p.tag && ` · ${p.tag}`} · {formatShortDate(p.date)}</span>
                  <span className={s.rowTitle}>{p.title}</span>
                  <span className={s.rowSummary}>{p.summary}</span>
                  <span className={`mono ${s.rowMeta}`}>{p.mins} min read</span>
                </Link>
                <div className={s.rowSave}>
                  <SaveButton compact item={{ kind: p.kind, slug: p.slug, title: p.title, href: p.href, meta: `${p.mins} min` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.section} aria-labelledby="notes">
          <div className={s.head}>
            <div className={s.headCopy}>
              <span className="eyebrow">02 · Notes</span>
              <h2 id="notes" className="h2">Notebooks I&apos;m working through</h2>
              <p className="lede">Study notes in order, one topic per notebook. Each part builds on the last.</p>
            </div>
            <div className={s.headLinks}><Link href="/learn">All notebooks →</Link></div>
          </div>
          <div className={s.cards}>
            {courses.map((c) => {
              const notes = c.topics.reduce((n, t) => n + t.links.length, 0);
              const parts = c.topics.map((t) => partName(t.title));
              return (
                <Link key={c.id} href={`/learn/${c.slug}`} className={`card ${s.course}`}>
                  <span className="eyebrow">{c.topics.length} parts · {notes} notes</span>
                  <span className={s.courseTitle}>{c.title}</span>
                  <span className={s.courseDesc}>{c.description}</span>
                  <span className={s.rail}>
                    {parts.slice(0, MAX_PARTS).map((p) => (
                      <span key={p} className={s.railItem}><span className={s.railDot} />{p}</span>
                    ))}
                    {parts.length > MAX_PARTS && <span className={`${s.railItem} ${s.railMore}`}>+{parts.length - MAX_PARTS} more</span>}
                  </span>
                  <span className={s.courseCta}>Open syllabus →</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={`darkCard ${s.contact}`} aria-labelledby="contact">
          <div className="glow" aria-hidden="true" />
          <div className={s.contactInner}>
            <div className={s.contactCopy}>
              <span className="eyebrow">Open to conversations</span>
              <h2 id="contact" className={s.contactH}>Building something and want a second pair of eyes?</h2>
              <p className={s.contactP}>Problems, collaborations or corrections — I read every email.</p>
            </div>
            <div className={s.contactActions}>
              <div className={s.contactBtns}>
                <a className={`btn ${s.mail}`} href={`mailto:${person.email}`}><Icon name="mail" size={15} />Email me</a>
                <a className={`btn ${s.gh}`} href={GITHUB} target="_blank" rel="noopener" aria-label="GitHub"><Icon name="github" size={17} /></a>
              </div>
              <div className={s.emailRow}>
                <span className={`mono ${s.email}`}>{person.email}</span>
                <CopyEmail email={person.email} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
