"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import styles from "./about-page.module.scss";

const stats = [
  ["210K+", "Visitors reached"],
  ["4×", "Hackathon winner"],
  ["2", "Production mobile apps"],
  ["3", "Core engineering domains"],
];

const experience = [
  {
    year: "2026 — Present",
    company: "Aionyix",
    role: "App Development Lead Intern",
    copy: "Leading MFD Stack’s production mobile application, owning feature architecture, API integration, performance, and release-ready implementation while contributing to backend workflows and system integrations.",
  },
  {
    year: "Sep 2025 — Feb 2026",
    company: "Scizers",
    role: "App Developer Intern",
    copy: "Built RealEdge from the ground up as a production CRM application for real-estate professionals, including core mobile workflows, backend integration, responsive UI, and stable real-time data flows.",
  },
];

const projects = [
  ["The Interview Room", "Community platform for company-specific interview experiences that reached more than 210,000 unique visitors.", "210K+ visitors"],
  ["WebGenie", "Local-first browser automation agent with planner, navigator, validator loops, compressed DOM context, and persistent task state.", "TypeScript · React · Agents"],
  ["Outreach AI", "Multi-agent outreach platform with research, profiling, RAG, memory, streaming, speech, and critic-based quality checks.", "Python · FastAPI · LangGraph"],
  ["AssistFlow AI", "API-first support platform with crawling, vector search, human handoff, ticketing, and embeddable chat widgets.", "Node.js · MongoDB · RAG"],
];

const skills = [
  ["Mobile & web", "React Native, React, TypeScript, Jetpack Compose, Chrome extensions"],
  ["Backend & data", "Node.js, Express, FastAPI, Spring Boot, PostgreSQL, MongoDB, Qdrant"],
  ["AI systems", "LangGraph, LangChain, RAG, LlamaIndex, Hugging Face, PyTorch, TensorFlow"],
  ["Infrastructure", "Docker, Kubernetes, Terraform, GitHub Actions, AWS, GCP, Linux"],
];

const fade = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };

export default function AboutPageClient() {
  const reduced = useReducedMotion();
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <motion.div
          className={styles.heroCopy}
          initial="hidden"
          animate="visible"
          variants={fade}
          transition={transition}
        >
          <p className={styles.kicker}>Software engineer · Pune, India</p>
          <h1>
            Manas
            <br />
            Khairnar<span>.</span>
          </h1>
          <p className={styles.role}>
            I build production mobile products, dependable backend systems,
            and practical AI agents.
          </p>
          <div className={styles.actions}>
            <Link href="/work">Selected work <ArrowUpRight size={16} /></Link>
            <a href="/resume/Manas Khairnar (1).pdf" target="_blank" rel="noreferrer">Resume</a>
          </div>
          <div className={styles.contactRow}>
            <a href="https://github.com/derpx06" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
            <a href="https://www.linkedin.com/in/manas-khairnar-98329132b/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="mailto:manaskhairnar1511@gmail.com" aria-label="Email"><Mail size={18} /></a>
            <span><MapPin size={14} /> Pune, India</span>
          </div>
        </motion.div>

        <motion.figure
          className={styles.portrait}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...transition, delay: reduced ? 0 : 0.12 }}
        >
          <Image
            src="/images/manas-khairnar-final.jpg"
            alt="Professional portrait of Manas Khairnar"
            width={400}
            height={500}
            sizes="(max-width: 900px) 100vw, 42vw"
            quality={90}
            priority
          />
          <figcaption><span /> Available for meaningful engineering work</figcaption>
        </motion.figure>

        <a className={styles.scrollCue} href="#about" aria-label="Scroll to About section">
          Scroll <ArrowDown size={14} />
        </a>
      </section>

      <section className={styles.stats} aria-label="Career highlights">
        {stats.map(([value, label], index) => (
          <motion.article
            key={label}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fade}
            transition={{ ...transition, delay: reduced ? 0 : index * 0.06 }}
          >
            <strong>{value}</strong><span>{label}</span>
          </motion.article>
        ))}
      </section>

      <section className={styles.intro} id="about">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={transition}>
          <p className={styles.sectionLabel}>01 / About</p>
          <h2>I care about the whole product, not only the code inside it.</h2>
        </motion.div>
        <motion.div className={styles.introCopy} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={transition}>
          <p>I am a software engineer working across mobile, backend, and AI systems. I enjoy projects where I can understand the real problem, shape the architecture, build the interface, connect the services, and keep improving the details until the result feels dependable.</p>
          <p>My work includes production CRM applications, browser agents, retrieval systems, community platforms, and multi-agent workflows. I optimize for clarity, maintainability, performance, and software that people can actually use.</p>
          <div className={styles.principles}>
            <span>Ownership over hand-offs</span>
            <span>Clarity over unnecessary complexity</span>
            <span>Shipping, measuring, and improving</span>
          </div>
        </motion.div>
      </section>

      <section className={styles.section}>
        <header><p className={styles.sectionLabel}>02 / Experience</p><h2>Production work with real ownership.</h2></header>
        <div className={styles.timeline}>
          {experience.map((item, index) => (
            <motion.article key={item.company} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fade} transition={{ ...transition, delay: reduced ? 0 : index * 0.08 }}>
              <time>{item.year}</time>
              <div><p>{item.company}</p><h3>{item.role}</h3><span>{item.copy}</span></div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header><p className={styles.sectionLabel}>03 / Selected work</p><h2>Projects that show how I think and build.</h2></header>
        <div className={styles.projects}>
          {projects.map(([name, copy, meta], index) => (
            <motion.article key={name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={{ ...transition, delay: reduced ? 0 : index * 0.06 }} whileHover={reduced ? undefined : { y: -4 }}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{name}</h3><p>{copy}</p>
              <footer><small>{meta}</small><Link href="/work" aria-label={`View ${name}`}><ArrowUpRight size={17} /></Link></footer>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header><p className={styles.sectionLabel}>04 / Capabilities</p><h2>A broad stack, used with intention.</h2></header>
        <div className={styles.skills}>
          {skills.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}
        </div>
      </section>

      <section className={styles.education}>
        <div><p className={styles.sectionLabel}>Education</p><h3>B.E. in Computer Engineering</h3><span>Pune Institute of Computer Technology · 2024—2028</span></div>
        <div><p className={styles.sectionLabel}>Leadership</p><h3>Tech Head · PICT INC</h3><span>4× hackathon winner and product-focused engineering lead.</span></div>
      </section>

      <motion.section className={styles.cta} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fade} transition={transition}>
        <p className={styles.sectionLabel}>Let’s work together</p>
        <h2>Have a difficult problem worth building for?</h2>
        <a href="mailto:manaskhairnar1511@gmail.com">Start a conversation <ArrowUpRight size={18} /></a>
      </motion.section>
    </main>
  );
}
