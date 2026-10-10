import type { Metadata } from "next";
import Link from "next/link";
import { SaveIcon } from "@/components/listing/SaveIcon";
import { HeroFx } from "@/components/site/HeroFx";
import { Icon } from "@/components/site/icons";
import { JsonLd } from "@/components/site/JsonLd";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { courseLessonCount, formatShortDate, getSiteSummary, type Piece } from "@/lib/site-data";
import { about, baseURL, home, person, social } from "@/resources";
import { CopyEmail, HomeHero, LocalTime, type Rot } from "./HomeHero";
import s from "./home.module.scss";

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

const MAX_PARTS = 5;
const partName = (title: string) => title.replace(/^\d+\.\s*/, "");
const kindOf = (piece: Piece) => (piece.href.startsWith("/explainers") ? "Explainer" : "Essay");

/** Hero phrases: a few hand-written ones per slug, then per tag, then the tag itself. */
const PHRASE_BY_SLUG: Record<string, string> = {
  "raft-consensus": "how Raft agrees.",
  "btrees-or-lsm-trees": "B-trees versus LSM trees.",
  "mamba-selective-state-spaces": "what Mamba changed.",
  "mobile-apps-are-distributed-systems": "why every app is distributed.",
  "quantization-what-breaks-at-4-bits": "what breaks at 4 bits.",
  "hnsw-vector-search": "how HNSW finds neighbours.",
  "your-retry-made-it-worse": "why retries make it worse.",
  "speculative-decoding": "how speculative decoding works.",
};
const PHRASE_BY_TAG: Record<string, string> = {
  "Distributed Systems": "how distributed systems fail.",
  Databases: "how databases store things.",
  Inference: "how inference gets fast.",
  "Research Papers": "what the paper actually says.",
  Retrieval: "how retrieval really works.",
  Agents: "what agents need.",
};
const phraseFor = (piece: Piece) =>
  PHRASE_BY_SLUG[piece.slug] ?? PHRASE_BY_TAG[piece.tag] ?? `${piece.tag.toLowerCase()}.`;

export default async function Home() {
  const { writing, explainers, courses } = await getSiteSummary();
  const all = [...writing, ...explainers]
    .map((piece) => ({ ...piece, resolved: resolveImage(piece.image) }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const rots: Rot[] = all
    .filter((piece) => piece.resolved)
    .slice(0, 4)
    .map((piece) => ({ text: phraseFor(piece), label: `${kindOf(piece)} · ${piece.tag}`, href: piece.href, img: piece.resolved }));

  const [cover, ...rest] = all.slice(0, 4);
  const socials = social.filter((item) => !item.link.startsWith("mailto:"));
  const github = social.find((item) => item.name === "GitHub")?.link;

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

      <HeroFx className={`hero ${s.hero}`}>
        <div className={s.heroBg} aria-hidden="true">
          <div className={s.glow} />
          <div className={s.spot} />
          <div className={s.dots} />
          <div className={s.dotsHot} />
        </div>
        <div className="heroFade" aria-hidden="true" />
        <HomeHero rots={rots} newest={cover ? { href: cover.href, title: cover.title } : null} />
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
          {cover ? (
            <Link href={cover.href} className={`darkCard ${s.cover}`}>
              <span className="glow" aria-hidden="true" />
              <span className={s.coverBody}>
                <span className={s.coverKicker}><span className={s.coverDot} />Cover story · {kindOf(cover)}{cover.tag && ` · ${cover.tag}`}</span>
                <span className={s.coverTitle}>{cover.title}</span>
                <span className={s.coverSummary}>{cover.summary}</span>
                <span className={s.coverMeta}>
                  <span className={s.coverRead}>Read · {cover.minutes} min <span className={s.arrow}>→</span></span>
                  <span className="mono">{formatShortDate(cover.publishedAt)}</span>
                </span>
              </span>
              <span className={s.coverFigure}>
                {cover.resolved ? <span className={s.coverImg} style={{ backgroundImage: `url(${cover.resolved})` }} /> : <span className={s.coverMark}>{cover.title.charAt(0)}</span>}
              </span>
            </Link>
          ) : (
            <p className="lede">Nothing published yet.</p>
          )}
          <div className={s.grid3}>
            {rest.map((p, i) => (
              <div key={p.href} className={`card ${s.pcard}`}>
                <Link href={p.href} className={s.pcardLink}>
                  <span className={s.pcardMedia}>
                    {p.resolved ? <span className={s.pcardImg} style={{ backgroundImage: `url(${p.resolved})` }} /> : <span className={s.pcardMark}>{p.title.replace(/^(The|A|An)\s/, "").charAt(0)}</span>}
                    <span className={s.pcardNum}>{String(i + 2).padStart(2, "0")}</span>
                  </span>
                  <span className={s.pcardBody}>
                    <span className="eyebrow">{kindOf(p)}{p.tag && ` · ${p.tag}`} · {formatShortDate(p.publishedAt)}</span>
                    <span className={s.pcardTitle}>{p.title}</span>
                    <span className={s.pcardSummary}>{p.summary}</span>
                    <span className={s.pcardFoot}><span className="mono">{p.minutes} min read</span><span className={s.pcardRead}>Read →</span></span>
                  </span>
                </Link>
                <span className={s.pcardSave}><SaveIcon piece={{ slug: p.slug, href: p.href, title: p.title, minutes: p.minutes }} /></span>
              </div>
            ))}
          </div>
        </section>

        {courses.length > 0 && (
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
                const notes = courseLessonCount(c);
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
        )}

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
                {github && <a className={`btn ${s.gh}`} href={github} target="_blank" rel="noopener" aria-label="GitHub"><Icon name="github" size={17} /></a>}
              </div>
              <div className={s.emailRow}>
                <span className={`mono ${s.email}`}>{person.email}</span>
                <CopyEmail email={person.email} />
              </div>
              <span className={`mono ${s.reply}`}>{person.location} · <LocalTime timeZone={person.timeZone} /> · usually replies within a day</span>
            </div>
          </div>
          <div className={s.contactFoot}>
            {socials.map((x) => (
              <a key={x.name} href={x.link} target="_blank" rel="noopener" className={s.socialPill}>{x.name}<span className="mono">{new URL(x.link).pathname.replace(/^\/(in|u)?\/?/, "").replace(/\/$/, "")}</span></a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
