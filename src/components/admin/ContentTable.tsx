"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/site/toast";
import type { ContentStatus } from "@/types/content.types";

/**
 * The content list, with the row actions.
 *
 * "Delete" archives — the document survives, disappears from the site and the
 * sitemap, and can be restored. The real purge is a separate action that asks
 * for the site password, because it cannot be undone.
 */

export type Row = {
  section: string;
  slug: string;
  title: string;
  status: ContentStatus;
  tag: string;
  publishedAt: string;
  updatedAt: string;
  words: number;
};

export function ContentTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (row: Row, run: () => Promise<Response>, done: string) => {
    const key = `${row.section}/${row.slug}`;
    setBusy(key);
    try {
      const response = await run();
      const data = await response.json().catch(() => ({}));

      if (response.status === 428) {
        addToast({
          variant: "danger",
          message: "Enter the site password on a protected page first, then try again.",
        });
        return;
      }
      if (response.status === 422) {
        addToast({
          variant: "danger",
          message: data.problems?.[0]?.detail ?? "Fix the editorial problems first.",
        });
        return;
      }
      if (!response.ok) throw new Error(data.error || "That did not work");

      addToast({ variant: "success", message: done });
      router.refresh();
    } catch (error) {
      addToast({
        variant: "danger",
        message: error instanceof Error ? error.message : "That did not work",
      });
    } finally {
      setBusy(null);
    }
  };

  const setStatus = (row: Row, status: ContentStatus) =>
    act(
      row,
      () =>
        fetch(`/api/admin/content/${row.section}/${row.slug}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      `${row.title} is now ${status}.`,
    );

  const purge = (row: Row) => {
    if (
      !window.confirm(
        `Permanently delete "${row.title}"?\n\nThis cannot be undone. Archive it instead if you might want it back.`,
      )
    ) {
      return;
    }
    return act(
      row,
      () => fetch(`/api/admin/content/${row.section}/${row.slug}?purge=1`, { method: "DELETE" }),
      `${row.title} deleted.`,
    );
  };

  if (rows.length === 0) {
    return <p className="ds-meta">Nothing here yet.</p>;
  }

  return (
    <table className="ds-admin-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Section</th>
          <th>Status</th>
          <th>Words</th>
          <th>Edited</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const key = `${row.section}/${row.slug}`;
          const working = busy === key;

          return (
            <tr key={key}>
              <td>
                <Link href={`/admin/content/${row.section}/${row.slug}`}>{row.title}</Link>
                <span className="ds-meta ds-meta-s" style={{ display: "block" }}>
                  /{row.section}/{row.slug}
                </span>
              </td>
              <td className="ds-meta ds-meta-s">{row.section}</td>
              <td>
                <span className={`ds-badge ds-badge-${row.status}`}>{row.status}</span>
              </td>
              <td className="ds-meta ds-meta-s">{row.words || "—"}</td>
              <td className="ds-meta ds-meta-s">
                {row.updatedAt ? row.updatedAt.slice(0, 10) : "—"}
              </td>
              <td>
                <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  {row.status === "published" ? (
                    <button
                      type="button"
                      className="ds-mini"
                      disabled={working}
                      onClick={() => setStatus(row, "draft")}
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ds-mini"
                      disabled={working}
                      onClick={() => setStatus(row, "published")}
                    >
                      Publish
                    </button>
                  )}

                  {row.status === "archived" ? (
                    <button
                      type="button"
                      className="ds-mini"
                      disabled={working}
                      onClick={() => setStatus(row, "draft")}
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="ds-mini"
                      disabled={working}
                      onClick={() => setStatus(row, "archived")}
                    >
                      Archive
                    </button>
                  )}

                  <button
                    type="button"
                    className="ds-mini ds-mini-danger"
                    disabled={working}
                    onClick={() => purge(row)}
                    title="Permanent — asks for confirmation"
                  >
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
