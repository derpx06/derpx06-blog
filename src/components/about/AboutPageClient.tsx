"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Code2,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Rocket,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import styles from "./about-page.module.scss";

const highlights = [
  { value: "210K+", label: "platform visitors", icon: Users },
  { value: "4×", label: "hackathon winner", icon: Trophy },
  { value: "2", label: "production mobile apps", icon: Rocket },
  { value: "3", label: "engineering domains", icon: Code2 },
];

const experience = [
  {
    company: "Aionyix",
    role: "App Development Lead Intern",
    period: "2026 — Present",
    summary:
      "Leading development of MFD Stack’s production mobile application while contributing to the backend systems that power reliable end-to-end CRM workflows.",
    points: [
      "Own feature architecture, API integration, performance, and release-ready implementation.",
      "Contribute to backend services, data handling, and system integrations across the product.",
    ],
  },
  {
    company: "Scizers",
    role: "App Developer Intern",
    period: "Sep 2025 — Feb 2026",
    summary:
      "Built RealEdge from the ground up as a production CRM application for real-estate professionals.",
    points: [
      "Delivered core React Native workflows and backend API integrations.",
      "Improved responsiveness, cross-device stability, and real-time data flows through production-focused testing.",
    ],
  },
];

const projects = [
  {
    name: "The Interview Room",
    description:
      "A community platform for discovering company-specific interview experiences, hiring rounds, and preparation insights.",
    meta: "210K+ unique visitors",
    href: "https://theinterviewroom.in",
  },
  {
    name: "WebGenie",
    description:
      "A local-first browser automation agent with planner, navigator, validator loops, compressed DOM context, and persistent task state.",
    meta: "TypeScript · React · Multi-agent",
    href: "/work",
  },
  {
    name: "Outreach AI",
    description:
      "A multi-agent outreach platform with prospect research, RAG, memory, streaming, text-to-speech, and critic-based quality checks.",
    meta: "Python · FastAPI · LangGraph",
    href: "/work",
  },
  {
    name: "AssistFlow AI",
    description:
      "An API-first support platform and embeddable chat widget with crawling, vector search, human handoff, and per-site knowledge bases.",
    meta: "Node.js · MongoDB · RAG",
    href: "/work",
  },
];

const skillGroups = [
  {
    title: "Mobile & Web",
    items: ["React Native", "React", "TypeScript", "Jetpack Compose", "Chrome Extensions"],
  },
  {
    title: "Backend & Data",
    items: ["Node.js", "Express.js", "FastAPI", "Spring Boot", "PostgreSQL", "MongoDB", "Qdrant"],
  },
  {
    title: "AI Systems",
    items: ["LangChain", "LangGraph", "RAG", "LlamaIndex", "Hugging Face", "PyTorch", "TensorFlow"],
  },
  {
    title: "Cloud & Infrastructure",
    items: ["Docker", "Kubernetes", "Terraform", "GitHub Actions", "AWS", "GCP", "Linux"],
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPageClient() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <main className={styles.page}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={styles.orbOne} />
        <span className={styles.orbTwo} />
        <span className={styles.grid} />
      </div>

      <section className={styles.hero}>
        <motion.div
          className={styles.heroCopy}
          initial="hidden"
          animate="visible"
          variants={reveal}
          transition={transition}
        >
          <div className={styles.eyebrow}>
            <Sparkles size={15} />
            Building useful systems from idea to production
          </div>
          <h1>
            I’m Manas — a software engineer working across
            <span> mobile, backend, and AI systems.</span>
          </h1>
          <p className={styles.lead}>
            I enjoy owning the complete engineering loop: understanding the problem, shaping the architecture,
            building the product, connecting the backend, and polishing the details until it feels dependable.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/work">
              Explore my work <ArrowUpRight size={17} />
            </Link>
            <a className={styles.secondaryAction} href="/resume/Manas Khairnar (1).pdf" target="_blank" rel="noreferrer">
              <Download size={17} /> Resume
            </a>
          </div>

          <div className={styles.socials}>
            <a href="https://github.com/derpx06" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
            <a href="https://www.linkedin.com/in/manas-khairnar-98329132b/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="mailto:manaskhairnar1511@gmail.com" aria-label="Email"><Mail size={18} /></a>
            <span><MapPin size={15} /> Pune, India</span>
          </div>
        </motion.div>

        <motion.div
          className={styles.portraitCard}
          initial={{ opacity: 0, scale: 0.94, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 }}
        >
          <div className={styles.portraitGlow} />
          <Image src="/images/derpx06-avatar.png" alt="Manas Khairnar" width={520} height={620} priority />
          <div className={styles.statusCard}>
            <span className={styles.statusDot} />
            Open to ambitious engineering work
          </div>
        </motion.div>
      </section>

      <motion.section
        className={styles.metrics}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={reveal}
        transition={transition}
      >
        {highlights.map(({ value, label, icon: Icon }) => (
          <article key={label}>
            <Icon size={19} />
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </motion.section>

      <section className={styles.contentGrid}>
        <div>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} transition={transition}>
            <span>01</span>
            <div>
              <p>My approach</p>
              <h2>Engineering with ownership, curiosity, and a product mindset.</h2>
            </div>
          </motion.div>

          <motion.div className={styles.storyCard} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} transition={transition}>
            <p>
              I am most energized by projects where the boundary between disciplines disappears. A mobile feature is not
              just a screen; it is an API contract, a data model, a performance problem, an operational workflow, and a
              real person trying to get something done.
            </p>
            <p>
              That perspective has shaped my work in production CRM applications, developer platforms, browser agents,
              retrieval systems, and multi-agent products. I care about clean architecture, thoughtful interfaces,
              measurable reliability, and shipping things people can actually use.
            </p>
          </motion.div>
        </div>

        <aside className={styles.principles}>
          <p className={styles.kicker}>What I optimize for</p>
          {["Clarity before complexity", "Production-quality execution", "Fast learning through building", "Systems that remain maintainable"].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.06 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </motion.div>
          ))}
        </aside>
      </section>

      <section className={styles.section} id="experience">
        <div className={styles.sectionHeader}>
          <span>02</span>
          <div><p>Experience</p><h2>Building and leading real products.</h2></div>
        </div>
        <div className={styles.timeline}>
          {experience.map((item, index) => (
            <motion.article
              key={item.company}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.08 }}
            >
              <div className={styles.timelineMarker}><BriefcaseBusiness size={18} /></div>
              <div className={styles.experienceTop}>
                <div><h3>{item.company}</h3><p>{item.role}</p></div>
                <time>{item.period}</time>
              </div>
              <p className={styles.experienceSummary}>{item.summary}</p>
              <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="projects">
        <div className={styles.sectionHeader}>
          <span>03</span>
          <div><p>Selected work</p><h2>Projects that reflect how I think.</h2></div>
        </div>
        <div className={styles.projectGrid}>
          {projects.map((project, index) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.06 }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
            >
              <div className={styles.projectNumber}>{String(index + 1).padStart(2, "0")}</div>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className={styles.projectFooter}>
                <span>{project.meta}</span>
                <Link href={project.href} aria-label={`Open ${project.name}`}><ArrowUpRight size={18} /></Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="skills">
        <div className={styles.sectionHeader}>
          <span>04</span>
          <div><p>Toolkit</p><h2>A broad stack, used with purpose.</h2></div>
        </div>
        <div className={styles.skillsGrid}>
          {skillGroups.map((group, index) => (
            <motion.article key={group.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.05 }}>
              <h3>{group.title}</h3>
              <div>{group.items.map((item) => <span key={item}>{item}</span>)}</div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.educationWrap}>
        <div className={styles.educationCard}>
          <GraduationCap size={23} />
          <div>
            <p>Education</p>
            <h3>B.E. in Computer Engineering</h3>
            <span>Pune Institute of Computer Technology · 2024—2028</span>
          </div>
        </div>
        <div className={styles.educationCard}>
          <Trophy size={23} />
          <div>
            <p>Leadership</p>
            <h3>Tech Head, PICT INC</h3>
            <span>Building teams, products, and a stronger maker culture.</span>
          </div>
        </div>
      </section>

      <motion.section className={styles.cta} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal} transition={transition}>
        <p>Have an ambitious idea?</p>
        <h2>Let’s build something people remember using.</h2>
        <a href="mailto:manaskhairnar1511@gmail.com">Start a conversation <ArrowUpRight size={18} /></a>
      </motion.section>
    </main>
  );
}
