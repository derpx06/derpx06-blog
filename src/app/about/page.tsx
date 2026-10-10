import classNames from "classnames";
import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";

import styles from "@/components/about/about.module.scss";
import { CopyEmail, LocalTime } from "@/components/about/AboutClient";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";
import { HeroFx } from "@/components/site/HeroFx";
import { Icon } from "@/components/site/icons";
import { JsonLd } from "@/components/site/JsonLd";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { getPieces } from "@/lib/site-data";
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

const RESUME = "/resume/Manas%20Khairnar%20(1).pdf";
const STATS = [
  { num: "210K+", label: "visitors on The Interview Room", accent: true },
  { num: "4×", label: "hackathon winner" },
  { num: "2", label: "production mobile apps" },
];

/** "github.com" from a profile link, or the last path segment as a handle. */
const host = (link: string) => new URL(link).hostname.replace(/^www\./, "");
const handle = (link: string) => new URL(link).pathname.split("/").filter(Boolean).pop() ?? host(link);

function Section({ id, n, title, blurb, children }: { id: string; n: string; title: string; blurb?: string; children: ReactNode }) {
  return (
    <section id={id} className={styles.section}>
      <div className={styles.aside}>
        <span className={styles.eyebrow}>{n}</span>
        <h2 className={styles.h2}>{title}</h2>
        {blurb && <p className={styles.asideP}>{blurb}</p>}
      </div>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

const Points = ({ items }: { items: ReactNode[] }) => (
  <>
    {items.map((p, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: fixed copy, never reordered
      <div key={i} className={styles.point}><span className={styles.dot} />{p}</div>
    ))}
  </>
);

const Pills = ({ items }: { items: string[] }) => (
  <div className={styles.chips}>{items.map((t) => <span key={t} className={styles.pill}>{t}</span>)}</div>
);

export default async function About() {
  const [writing, explainers] = await Promise.all([getPieces("blog"), getPieces("explainers")]);
  const stats = [...STATS, { num: String(writing.length + explainers.length), label: "essays and paper explainers" }];
  const now = about.work.experiences[0];
  const school = about.studies.institutions[0];
  const city = person.location.split(",")[0];
  const github = social.find((item) => item.name === "GitHub")?.link;
  const socials = social.filter((item) => item.name !== "Email" && item.link);
  const featured = projects.find((p) => p.name === "The Interview Room");
  const rest = projects.filter((p) => p !== featured);
  const portrait = resolveImage(person.avatar);
  const chips = about.technical.skills.flatMap((k) => (k.tags ?? []).slice(0, 2).map((t) => t.name)).slice(0, 5);
  const linked = achievements.filter((a) => a.href);
  const plain = achievements.filter((a) => !a.href);

  return (
    <main id="main" className={styles.root}>
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={about.path}
        title={about.title}
        description={about.description}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: person.avatar }}
      />

      <HeroFx className={`hero ${styles.hero}`}>
        <HeroBackdrop />
        <div className={classNames(styles.wrap, styles.heroGrid)}>
          <div className={styles.heroCopy}>
            <span className={styles.status}><span className={styles.statusDot} />Open to interesting problems</span>
            <h1 className={styles.h1}>Hi, I&apos;m {person.firstName}. I build systems and <span>write down what breaks.</span></h1>
            <p className={styles.lede}>{person.name} on the internet. I ship production mobile apps, backend services and agentic AI systems — and turn what I learn into the essays, explainers and notes on this site.</p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href={`mailto:${person.email}`}>Email me <span>→</span></a>
              <a className={styles.btnGhost} href={RESUME} target="_blank" rel="noopener">Résumé (PDF) ↗</a>
              {github && (
                <a className={classNames(styles.btnGhost, styles.btnIcon)} href={github} target="_blank" rel="noopener" aria-label="GitHub">
                  <Icon name="github" size={17} />
                </a>
              )}
            </div>
          </div>
          <div className={styles.portrait}>
            <div className={styles.photo}>
              {portrait && <Image src={portrait} alt={person.name} fill sizes="420px" priority />}
              <span className={styles.clock}>{city} · <LocalTime timeZone={person.timeZone} /></span>
            </div>
            <div className={styles.portraitMeta}>
              <div className={styles.portraitRow}>
                <span className={styles.portraitName}>{person.firstName} {person.lastName}</span>
                {now && <span className={styles.portraitNow}>Now · {now.company}</span>}
              </div>
              <div className={styles.chips}>
                {chips.map((t) => <span key={t} className={styles.chip}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.wrap}>
          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={classNames(styles.statNum, "accent" in s && s.accent && styles.accent)}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </HeroFx>

      <div className={classNames(styles.wrap, styles.main)}>
        <Section id="now" n={`01 · ${about.intro.title}`} title="The short version">
          <div className={styles.prose}>
            <p>{about.intro.description}</p>
            <p>This site is where I write down what I learn — usually after getting it wrong first. Essays argue one point, explainers walk through one paper, and the notebooks are my study notes, in order.</p>
          </div>
          <div className={styles.facts}>
            {now && <div className={styles.fact}><span className={styles.eyebrow}>Role</span><span className={styles.factV}>{now.role} · {now.company}</span></div>}
            {school && <div className={styles.fact}><span className={styles.eyebrow}>Studying</span><span className={styles.factV}>{school.name}</span></div>}
            <div className={styles.fact}><span className={styles.eyebrow}>Based in</span><span className={styles.factV}>{person.location} · <LocalTime timeZone={person.timeZone} /></span></div>
          </div>
        </Section>

        <Section id="experience" n={`02 · ${about.work.title}`} title="Where I've shipped" blurb="Production apps, real users, real releases.">
          <div className={styles.rows}>
            {about.work.experiences.map((r) => (
              <div key={`${r.company}-${r.role}`} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.eyebrow}>{r.timeframe}</span>
                  <span className={styles.rowTitle}>{r.company}</span>
                  <span className={styles.rowSub}>{r.role}</span>
                  {r.link && <a className={styles.rowLink} href={r.link} target="_blank" rel="noopener">{host(r.link)} ↗</a>}
                </div>
                <div className={styles.points}><Points items={r.achievements} /></div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="projects" n="03 · Projects" title="Built outside work" blurb="Mostly local-first, mostly agents.">
          {featured && (
            <a className={styles.featured} href={featured.href} target="_blank" rel="noopener">
              <span className={styles.featuredGlow} aria-hidden="true" />
              <span className={styles.featuredCopy}>
                <span className={styles.stack} style={{ textTransform: "uppercase", letterSpacing: ".12em" }}>Featured · {featured.stack}</span>
                <span className={styles.featuredTitle}>{featured.name} ↗</span>
                <span className={styles.cardP}>{featured.description}</span>
              </span>
              <span className={styles.featuredStat}>
                <span className={styles.featuredNum}>{STATS[0].num}</span>
                <span className={styles.portraitNow}>unique visitors</span>
              </span>
            </a>
          )}
          <div className={styles.cards}>
            {rest.map((p) => (
              <a key={p.name} className={styles.card} href={p.href} target="_blank" rel="noopener">
                <span className={styles.cardHead}>{p.name}<span className={styles.arrow}>↗</span></span>
                <span className={styles.stack}>{p.stack}</span>
                <span className={styles.cardP}>{p.description}</span>
              </a>
            ))}
          </div>
          {github && <a className={styles.more} href={github} target="_blank" rel="noopener">All projects on GitHub ↗</a>}
        </Section>

        <Section id="toolkit" n={`04 · ${about.technical.title}`} title="The whole thing, not a slice of it" blurb="From the app on the phone to the service behind it and the model behind that.">
          <div className={styles.rows}>
            {about.technical.skills.map((k, i) => (
              <div key={k.title} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.eyebrow}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.skillTitle}>{k.title}</span>
                </div>
                <div className={styles.points}>
                  <span className={styles.skillDesc}>{k.description}</span>
                  <Pills items={(k.tags ?? []).map((t) => t.name)} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="studies" n={`05 · ${about.studies.title} & more`} title="Outside the day job">
          <div className={styles.pair}>
            <div className={styles.card}>
              <span className={styles.eyebrow}>{about.studies.title}</span>
              {about.studies.institutions.map((inst) => (
                <div key={inst.name} style={{ display: "contents" }}>
                  <span className={styles.skillTitle}>{inst.name}</span>
                  <span className={styles.cardP}>{inst.description}</span>
                </div>
              ))}
              {person.languages?.length ? (
                <>
                  <span className={styles.eyebrow} style={{ marginTop: 12 }}>Languages</span>
                  <Pills items={person.languages} />
                </>
              ) : null}
            </div>
            <div className={styles.card} style={{ gap: 12 }}>
              <span className={styles.eyebrow}>Also</span>
              <Points items={plain.map((a) => a.label)} />
              {linked.map((a) => (
                <a key={a.label} className={styles.point} href={a.href} target="_blank" rel="noopener">
                  <span className={styles.dot} />{a.label} ↗
                </a>
              ))}
            </div>
          </div>
        </Section>

        <section id="contact" className={styles.contact}>
          <div className={styles.contactTop}>
            <div className={styles.contactCopy}>
              <span className={styles.eyebrow}>Say hello</span>
              <h2 className={styles.contactH}>Interesting problem, teaching collab, or a correction?</h2>
              <span className={styles.contactP}>All three are welcome. I read everything.</span>
            </div>
            <div className={styles.contactBtns}>
              <a className={styles.mail} href={`mailto:${person.email}`}>Email me <span>→</span></a>
              <CopyEmail email={person.email} />
            </div>
          </div>
          <div className={styles.socials}>
            {socials.map((s) => (
              <a key={s.name} className={styles.social} href={s.link} target="_blank" rel="noopener">{s.name}<small>{handle(s.link)}</small></a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
