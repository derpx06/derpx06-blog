"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminArticle } from "@/utils/utils";
import styles from "./admin.module.scss";

const SECTION_LABEL = { blog: "Writing", explainers: "Explainer" } as const;
type Status = "all" | "published" | "draft";
const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
};

export function AdminTable({ articles, initialStatus = "all" }: { articles: AdminArticle[]; initialStatus?: Status }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [section, setSection] = useState<"all" | AdminArticle["section"]>("all");
  const [status, setStatus] = useState<Status>(initialStatus);
  const [busy, setBusy] = useState("");
  const [confirmKey, setConfirmKey] = useState("");
  const [msg, setMsg] = useState<{ error?: boolean; text: string }>({ text: "" });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return articles.filter((a) =>
      (section === "all" || a.section === section) &&
      (status === "all" || (status === "published") === a.published) &&
      (!needle || a.title.toLowerCase().includes(needle) || a.slug.includes(needle)));
  }, [articles, q, section, status]);

  async function call(key: string, init: RequestInit, url = "/api/articles") {
    setBusy(key); setConfirmKey(""); setMsg({ text: "" });
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Request failed");
      router.refresh();
      return data;
    } catch (e) {
      setMsg({ error: true, text: e instanceof Error ? e.message : "Request failed" });
    } finally {
      setBusy("");
    }
  }

  const togglePublished = (a: AdminArticle) =>
    call(`${a.section}/${a.slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setPublished", slug: a.slug, section: a.section, published: !a.published }),
    }).then((d) => d && setMsg({ text: `${a.published ? "Unpublished" : "Published"} “${a.title}”` }));

  const remove = (a: AdminArticle) =>
    call(`${a.section}/${a.slug}`, { method: "DELETE" }, `/api/articles?slug=${encodeURIComponent(a.slug)}&section=${a.section}`)
      .then((d) => d && setMsg({ text: `Deleted “${a.title}”` }));

  return (
    <>
      <div className={styles.filters}>
        <input className={styles.search} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or slug…" aria-label="Search articles" />
        <select className={styles.select} value={section} onChange={(e) => setSection(e.target.value as typeof section)} aria-label="Section">
          <option value="all">All sections</option>
          <option value="blog">Writing</option>
          <option value="explainers">Explainers</option>
        </select>
        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as Status)} aria-label="Status">
          <option value="all">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>
      <div className={`${styles.msg} ${msg.error ? styles.error : ""}`} role="status" aria-live="polite">{msg.text}</div>

      {rows.length === 0 && <p className="lede">{articles.length ? "Nothing matches those filters." : "No articles yet. Write the first one."}</p>}
      <div className={styles.list}>
        {rows.map((a) => {
          const key = `${a.section}/${a.slug}`;
          const href = `/${a.section}/${a.slug}`;
          const edit = `/blog/editor?slug=${encodeURIComponent(a.slug)}&section=${a.section}`;
          const canDelete = a.storage === "mongodb" || !a.published;
          return (
            <div key={key} className={`card ${styles.row}`}>
              <div className={styles.meta}>
                <div className={styles.titleLine}>
                  <span className={`${styles.pill} ${a.published ? styles.live : ""}`}>{a.published ? "Published" : "Draft"}</span>
                  <Link href={edit}><strong>{a.title}</strong></Link>
                </div>
                <span className="mono">
                  {SECTION_LABEL[a.section]} · /{a.slug} · {a.storage === "mongodb" ? "MongoDB" : "MDX"} · {a.sources} source{a.sources === 1 ? "" : "s"} · updated {fmt(a.updatedAt)}
                </span>
              </div>
              <div className={styles.actions}>
                {confirmKey === key ? (
                  <>
                    <span className={styles.confirmText}>Delete for good?</span>
                    <button type="button" className={`btn btnSm ${styles.danger}`} onClick={() => remove(a)}>Delete</button>
                    <button type="button" className="btn btnGhost btnSm" onClick={() => setConfirmKey("")}>Cancel</button>
                  </>
                ) : (
                  <>
                    <Link href={edit} className="btn btnGhost btnSm">Edit</Link>
                    {a.published && <a href={href} target="_blank" rel="noopener" className="btn btnGhost btnSm">View</a>}
                    {a.storage === "mongodb" && (
                      <button type="button" className="btn btnGhost btnSm" disabled={busy === key} onClick={() => togglePublished(a)}>
                        {busy === key ? "…" : a.published ? "Unpublish" : "Publish"}
                      </button>
                    )}
                    {canDelete && (
                      <button type="button" className={`btn btnGhost btnSm ${styles.dangerGhost}`} disabled={busy === key} onClick={() => setConfirmKey(key)}>Delete</button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
