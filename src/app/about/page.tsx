import { Meta, Schema } from "@once-ui-system/core";
import Image from "next/image";
import classNames from "classnames";
import { baseURL, about, person } from "@/resources";
import { getPosts } from "@/utils/utils";
import { CopyEmail, LocalTime } from "@/components/about/AboutClient";
import styles from "@/components/about/about.module.scss";
import { HeroFx } from "@/components/site/HeroFx";
import { HeroBackdrop } from "@/components/site/HeroBackdrop";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

const EMAIL = "manaskhairnar1511@gmail.com";
const RESUME = "/resume/Manas%20Khairnar%20(1).pdf";

const STATS = [
  { num: "210K+", label: "visitors on The Interview Room", accent: true },
  { num: "4×", label: "hackathon winner" },
  { num: "2", label: "production mobile apps" },
];
const pieceCount = () => getPosts(["src", "app", "blog", "posts"]).length + getPosts(["src", "app", "explainers", "posts"]).length;
const SKILLS = [
  { title: "Mobile products", desc: "Production React Native and Jetpack Compose apps, shipped and maintained on store.", tags: ["React Native", "Jetpack Compose", "Kotlin", "TypeScript", "React"] },
  { title: "Backend & data", desc: "APIs, services and the storage decisions that decide how they age.", tags: ["Node.js", "Express.js", "FastAPI", "Spring Boot", "PostgreSQL", "MongoDB", "Qdrant"] },
  { title: "Agentic AI", desc: "Retrieval, multi-agent workflows, and evaluation you can actually trust.", tags: ["LangChain", "LangGraph", "RAG", "LlamaIndex", "Hugging Face", "PyTorch", "TensorFlow"] },
  { title: "Cloud & delivery", desc: "Containers, pipelines and the boring plumbing that makes releases dull.", tags: ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "AWS", "GCP", "Linux", "Git"] },
];
const ROLES = [
  { company: "Aionyix", role: "App Development Lead Intern", when: "2026 — Present", link: "https://mfdstack.com/", linkLabel: "mfdstack.com ↗",
    points: ["Lead development of MFD Stack's production mobile application — feature architecture, API integration, performance and release-ready implementation.", "Contribute the backend services, API workflows and data handling that keep end-to-end CRM operations reliable."] },
  { company: "Scizers", role: "App Developer Intern", when: "Sep 2025 — Feb 2026", link: "https://play.google.com/store/apps/details?id=com.realedgetech.app", linkLabel: "RealEdge on Google Play ↗",
    points: ["Built RealEdge from the ground up: a production CRM for real-estate professionals, shipped on Google Play.", "Improved UI responsiveness, cross-device stability and real-time data flow through production-focused development and testing."] },
];
const PROJECTS = [
  { name: "WebGenie", href: "https://github.com/derpx06/webgenie", stack: "TypeScript · React · Chrome MV3 · Multi-agent", desc: "Local-first browser automation agent with planner, navigator and validator loops, compressed DOM context, persistent task state and sandboxed browser actions." },
  { name: "Outreach AI", href: "https://github.com/derpx06/Outreach_bot", stack: "Python · FastAPI · LangGraph · Ollama", desc: "Local-first multi-agent outreach platform: prospect research, profiling, multi-channel drafting, RAG, memory, streaming and critic-based quality checks." },
  { name: "AssistFlow AI", href: "https://github.com/derpx06/AssistFlow-Ai", stack: "Node.js · React · MongoDB · RAG", desc: "API-first support platform with an embeddable chat widget on npm — site crawling, vector search, AI-to-human handoff, ticketing and per-site knowledge bases." },
  { name: "CollabSphere", href: "https://github.com/ParagD1606/CollabSphere", stack: "React · Node.js · Socket.IO · Semantic search", desc: "Developer collaboration platform with real-time chat, AI-assisted planning, skill-gap analysis and semantic candidate matching." },
];
const SOCIALS = [
  { name: "GitHub", handle: "derpx06", href: "https://github.com/derpx06" },
  { name: "LinkedIn", handle: "manas-khairnar", href: "https://www.linkedin.com/in/manas-khairnar-98329132b/" },
  { name: "Hugging Face", handle: "Manas200", href: "https://huggingface.co/Manas200" },
  { name: "LeetCode", handle: "manas1511", href: "https://leetcode.com/u/manas1511/" },
];
const LANGUAGES = ["English", "Hindi", "Marathi", "German"];
const ALSO = ["Tech Head — PICT INC", "Tech Team — Startup & Innovation Cell, PICT", "4× hackathon winner — AI, backend and app development"];
const HF = "https://huggingface.co/Manas200/shellm-qwen-0.5b-nl2sh-finetuned";

function Section({ id, n, title, blurb, children }: { id: string; n: string; title: string; blurb?: string; children: React.ReactNode }) {
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

const Points = ({ items }: { items: string[] }) => (
  <>
    {items.map((p) => (
      <div key={p} className={styles.point}><span className={styles.dot} />{p}</div>
    ))}
  </>
);

const Pills = ({ items }: { items: string[] }) => (
  <div className={styles.chips}>{items.map((t) => <span key={t} className={styles.pill}>{t}</span>)}</div>
);

export default function About() {
  const stats = [...STATS, { num: String(pieceCount()), label: "essays and paper explainers" }];
  return (
    <div className={styles.root}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{ name: person.name, url: `${baseURL}${about.path}`, image: `${baseURL}${person.avatar}` }}
      />

      <HeroFx className={`hero ${styles.hero}`}>
        <HeroBackdrop />
        <div className={classNames(styles.wrap, styles.heroGrid)}>
          <div className={styles.heroCopy}>
            <span className={styles.status}><span className={styles.statusDot} />Open to interesting problems</span>
            <h1 className={styles.h1}>Hi, I&apos;m Manas. I build systems and <span>write down what breaks.</span></h1>
            <p className={styles.lede}>Derpx06 on the internet. I ship production mobile apps, backend services and agentic AI systems — and turn what I learn into the essays, explainers and notes on this site.</p>
            <div className={styles.actions}>
              <a className={styles.btnPrimary} href={`mailto:${EMAIL}`}>Email me <span>→</span></a>
              <a className={styles.btnGhost} href={RESUME} target="_blank" rel="noopener">Résumé (PDF) ↗</a>
              <a className={classNames(styles.btnGhost, styles.btnIcon)} href="https://github.com/derpx06" target="_blank" rel="noopener" aria-label="GitHub">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
            </div>
          </div>
          <div className={styles.portrait}>
            <div className={styles.photo}>
              <Image src="/images/manas.jpg" alt="Manas Khairnar" fill sizes="420px" priority />
              <span className={styles.clock}>Pune · <LocalTime /> IST</span>
            </div>
            <div className={styles.portraitMeta}>
              <div className={styles.portraitRow}>
                <span className={styles.portraitName}>Manas Khairnar</span>
                <span className={styles.portraitNow}>Now · Aionyix</span>
              </div>
              <div className={styles.chips}>
                {["React Native", "Jetpack Compose", "Node.js", "FastAPI", "LangGraph"].map((t) => <span key={t} className={styles.chip}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.wrap}>
          <div className={styles.stats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.stat}>
                <div className={classNames(styles.statNum, s.accent && styles.accent)}>{s.num}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </HeroFx>

      <div className={classNames(styles.wrap, styles.main)}>
        <Section id="now" n="01 · Now" title="The short version">
          <div className={styles.prose}>
            <p>I build the whole thing: the app on the phone, the service behind it, and increasingly the model behind that. Right now that means leading mobile development at Aionyix while studying Computer Engineering at PICT.</p>
            <p>This site is where I write down what I learn — usually after getting it wrong first. Essays argue one point, explainers walk through one paper, and the notebooks are my study notes, in order.</p>
          </div>
          <div className={styles.facts}>
            {[
              ["Role", "App Development Lead · Aionyix"],
              ["Studying", "B.E. Computer Engineering · PICT"],
            ].map(([k, v]) => (
              <div key={k} className={styles.fact}><span className={styles.eyebrow}>{k}</span><span className={styles.factV}>{v}</span></div>
            ))}
            <div className={styles.fact}><span className={styles.eyebrow}>Based in</span><span className={styles.factV}>Pune, India · <LocalTime /> IST</span></div>
          </div>
        </Section>

        <Section id="experience" n="02 · Experience" title="Where I've shipped" blurb="Production apps, real users, real releases.">
          <div className={styles.rows}>
            {ROLES.map((r) => (
              <div key={r.company} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.eyebrow}>{r.when}</span>
                  <span className={styles.rowTitle}>{r.company}</span>
                  <span className={styles.rowSub}>{r.role}</span>
                  <a className={styles.rowLink} href={r.link} target="_blank" rel="noopener">{r.linkLabel}</a>
                </div>
                <div className={styles.points}><Points items={r.points} /></div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="projects" n="03 · Projects" title="Built outside work" blurb="Mostly local-first, mostly agents.">
          <a className={styles.featured} href="https://theinterviewroom.in/" target="_blank" rel="noopener">
            <span className={styles.featuredGlow} aria-hidden="true" />
            <span className={styles.featuredCopy}>
              <span className={styles.stack} style={{ textTransform: "uppercase", letterSpacing: ".12em" }}>Featured · Full-stack · Community</span>
              <span className={styles.featuredTitle}>The Interview Room ↗</span>
              <span className={styles.cardP}>A platform where students share company-specific interview experiences, hiring rounds and preparation notes.</span>
            </span>
            <span className={styles.featuredStat}>
              <span className={styles.featuredNum}>210K+</span>
              <span className={styles.portraitNow}>unique visitors</span>
            </span>
          </a>
          <div className={styles.cards}>
            {PROJECTS.map((p) => (
              <a key={p.name} className={styles.card} href={p.href} target="_blank" rel="noopener">
                <span className={styles.cardHead}>{p.name}<span className={styles.arrow}>↗</span></span>
                <span className={styles.stack}>{p.stack}</span>
                <span className={styles.cardP}>{p.desc}</span>
              </a>
            ))}
          </div>
          <a className={styles.more} href="https://github.com/derpx06" target="_blank" rel="noopener">All projects on GitHub ↗</a>
        </Section>

        <Section id="toolkit" n="04 · Toolkit" title="The whole thing, not a slice of it" blurb="From the app on the phone to the service behind it and the model behind that.">
          <div className={styles.rows}>
            {SKILLS.map((k, i) => (
              <div key={k.title} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.eyebrow}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.skillTitle}>{k.title}</span>
                </div>
                <div className={styles.points}>
                  <span className={styles.skillDesc}>{k.desc}</span>
                  <Pills items={k.tags} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="studies" n="05 · Studies & more" title="Outside the day job">
          <div className={styles.pair}>
            <div className={styles.card}>
              <span className={styles.eyebrow}>Studies · 2024 — 2028</span>
              <span className={styles.skillTitle}>Pune Institute of Computer Technology</span>
              <span className={styles.cardP}>B.E. in Computer Engineering.</span>
              <span className={styles.eyebrow} style={{ marginTop: 12 }}>Languages</span>
              <Pills items={LANGUAGES} />
            </div>
            <div className={styles.card} style={{ gap: 12 }}>
              <span className={styles.eyebrow}>Also</span>
              <Points items={ALSO} />
              <a className={styles.point} href={HF} target="_blank" rel="noopener">
                <span className={styles.dot} />Published a fine-tuned Qwen 0.5B for natural-language-to-shell ↗
              </a>
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
              <a className={styles.mail} href={`mailto:${EMAIL}`}>Email me <span>→</span></a>
              <CopyEmail />
            </div>
          </div>
          <div className={styles.socials}>
            {SOCIALS.map((s) => (
              <a key={s.name} className={styles.social} href={s.href} target="_blank" rel="noopener">{s.name}<small>{s.handle}</small></a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
