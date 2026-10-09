import fs from "fs";
import path from "path";
import Link from "next/link";
import matter from "gray-matter";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import styles from "./drafts.module.scss";

export const metadata: Metadata = { title: "Drafts", robots: { index: false, follow: false } };

const SECTIONS = [
  { id: "blog", label: "Writing" },
  { id: "explainers", label: "Explainers" },
] as const;

function listDrafts() {
  return SECTIONS.flatMap(({ id, label }) => {
    const dir = path.join(process.cwd(), "src", "app", id, "drafts");
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => f.endsWith(".mdx")).map((f) => {
      const file = path.join(dir, f);
      const { data } = matter(fs.readFileSync(file, "utf8"));
      return { slug: f.replace(/\.mdx$/, ""), section: id, sectionLabel: label, title: (data.title as string) || f, updated: fs.statSync(file).mtime };
    });
  }).sort((a, b) => b.updated.getTime() - a.updated.getTime());
}

export default async function DraftsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");
  if (!isAdminEmail(session.user?.email)) notFound();

  const drafts = listDrafts();
  const fmt = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <span className="eyebrow">Editor · Drafts</span>
          <h1>Drafts</h1>
        </div>
        <Link href="/blog/editor" className="btn btnPrimary btnSm">New article →</Link>
      </div>
      {drafts.length === 0 && <p className="lede">No drafts yet.</p>}
      <div className={styles.list}>
        {drafts.map((d) => (
          <div key={`${d.section}/${d.slug}`} className={`card ${styles.row}`}>
            <div className={styles.meta}>
              <strong>{d.title}</strong>
              <span className="mono">{d.sectionLabel} · /{d.slug} · {fmt.format(d.updated)}</span>
            </div>
            <Link href={`/blog/editor?slug=${encodeURIComponent(d.slug)}&section=${d.section}`} className="btn btnGhost btnSm">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
