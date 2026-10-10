import Link from "next/link";
import fs from "fs";
import path from "path";
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
import { LocalTime } from "@/components/about/AboutClient";

const SOCIALS = [
  { name: "GitHub", handle: "derpx06", href: "https://github.com/derpx06" },
  { name: "LinkedIn", handle: "manas-khairnar", href: "https://www.linkedin.com/in/manas-khairnar-98329132b/" },
  { name: "Hugging Face", handle: "Manas200", href: "https://huggingface.co/Manas200" },
  { name: "LeetCode", handle: "manas1511", href: "https://leetcode.com/u/manas1511/" },
];
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
      image: p.metadata.image && fs.existsSync(path.join(process.cwd(), "public", p.metadata.image)) ? p.metadata.image : null,
    })),
  )
    .sort((a, b) => b.time - a.time)
    .slice(0, n);
}

export default function Home() {
  const posts = latest(4);
  const newest = posts[0];
  const [cover, ...rest] = posts;

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
          {cover && (
            <Link href={cover.href} className={`darkCard ${s.cover}`}>
              <span className="glow" aria-hidden="true" />
              <span className={s.coverBody}>
                <span className={s.coverKicker}><span className={s.coverDot} />Cover story · {cover.label}{cover.tag && ` · ${cover.tag}`}</span>
                <span className={s.coverTitle}>{cover.title}</span>
                <span className={s.coverSummary}>{cover.summary}</span>
                <span className={s.coverMeta}>
                  <span className={s.coverRead}>Read · {cover.mins} min <span className={s.arrow}>→</span></span>
                  <span className="mono">{formatShortDate(cover.date)}</span>
                </span>
              </span>
              <span className={s.coverFigure}>
                {cover.image ? <span className={s.coverImg} style={{ backgroundImage: `url(${cover.image})` }} /> : <span className={s.coverMark}>{cover.title.charAt(0)}</span>}
              </span>
            </Link>
          )}
          <div className={s.grid3}>
            {rest.map((p, i) => (
              <div key={p.href} className={`card ${s.pcard}`}>
                <Link href={p.href} className={s.pcardLink}>
                  <span className={s.pcardMedia}>
                    {p.image ? <span className={s.pcardImg} style={{ backgroundImage: `url(${p.image})` }} /> : <span className={s.pcardMark}>{p.title.replace(/^(The|A|An)\s/, "").charAt(0)}</span>}
                    <span className={s.pcardNum}>{String(i + 2).padStart(2, "0")}</span>
                  </span>
                  <span className={s.pcardBody}>
                    <span className="eyebrow">{p.label}{p.tag && ` · ${p.tag}`} · {formatShortDate(p.date)}</span>
                    <span className={s.pcardTitle}>{p.title}</span>
                    <span className={s.pcardSummary}>{p.summary}</span>
                    <span className={s.pcardFoot}><span className="mono">{p.mins} min read</span><span className={s.pcardRead}>Read →</span></span>
                  </span>
                </Link>
                <span className={s.pcardSave}><SaveButton compact item={{ kind: p.kind, slug: p.slug, title: p.title, href: p.href, meta: `${p.mins} min` }} /></span>
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
              <span className={`mono ${s.reply}`}>Pune · <LocalTime /> IST · usually replies within a day</span>
            </div>
          </div>
          <div className={s.contactFoot}>
            {SOCIALS.map((x) => (
              <a key={x.name} href={x.href} target="_blank" rel="noopener" className={s.socialPill}>{x.name}<span className="mono">{x.handle}</span></a>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
