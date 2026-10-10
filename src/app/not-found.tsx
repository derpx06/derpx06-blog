import Link from "next/link";
import styles from "./not-found.module.scss";

const LINKS = [
  { n: "01", label: "Home", href: "/", hint: "Start from the top." },
  { n: "02", label: "Writing", href: "/blog", hint: "Long-form essays on systems and AI." },
  { n: "03", label: "Explainers", href: "/explainers", hint: "Landmark papers, one idea at a time." },
  { n: "04", label: "Notes", href: "/learn", hint: "Structured learning notes, in order." },
];

export default function NotFound() {
  return (
    <main id="main" className={`wrap ${styles.root}`}>
      <section className={`darkCard ${styles.card}`}>
        <div className="glow" aria-hidden="true" />
        <span className="eyebrow">HTTP 404 · page not found</span>
        <div className={styles.big} aria-hidden="true">404</div>
        <h1 className={styles.h1}>This page failed at its boundary.</h1>
        <p className={styles.p}>The link might be old, or the piece moved. Head somewhere that exists.</p>
      </section>
      <div className={styles.grid}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={`card ${styles.link}`}>
            <span className="mono">{l.n}</span>
            <span className={styles.label}>{l.label}<span>→</span></span>
            <span className={styles.hint}>{l.hint}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
