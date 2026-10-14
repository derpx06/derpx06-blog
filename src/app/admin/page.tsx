import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { getAllArticlesForAdmin, mongoEnabled } from "@/utils/utils";
import { AdminTable } from "./AdminTable";
import styles from "./admin.module.scss";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/signin?callbackUrl=/admin");
  if (!isAdminEmail(session.user?.email)) notFound();

  const articles = await getAllArticlesForAdmin();
  const stats = [
    ["Published", articles.filter((a) => a.published).length],
    ["Drafts", articles.filter((a) => !a.published).length],
    ["In MongoDB", articles.filter((a) => a.storage === "mongodb").length],
    ["MDX files", articles.filter((a) => a.storage === "mdx").length],
  ] as const;

  return (
    <div className={`wrap ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <span className="eyebrow">Admin · {session.user?.email}</span>
          <h1>Dashboard</h1>
        </div>
        <Link href="/blog/editor" className="btn btnPrimary btnSm">New article →</Link>
      </div>
      {!mongoEnabled() && (
        <p className={`card ${styles.warn}`}>
          <b>MongoDB is off.</b> Set <code>USE_MONGODB=true</code> so posts written here go live on the deployed site. MDX files written at runtime only persist locally.
        </p>
      )}
      <div className={styles.stats}>
        {stats.map(([label, n]) => (
          <div key={label} className={`card ${styles.stat}`}><b>{n}</b><span>{label}</span></div>
        ))}
      </div>
      <AdminTable articles={articles} initialStatus={(await searchParams).status === "draft" ? "draft" : "all"} />
    </div>
  );
}
