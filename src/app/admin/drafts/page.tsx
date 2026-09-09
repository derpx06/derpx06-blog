import Link from "next/link";
import { ContentTable } from "@/components/admin/ContentTable";
import { listContent } from "@/lib/admin/content-writes";

/**
 * The draft store: everything unpublished, across every section.
 *
 * The old /blog/editor/drafts only ever listed blog, so a draft explainer or
 * lesson was invisible.
 */
export default async function DraftsPage() {
  const [drafts, archived] = await Promise.all([
    listContent({ status: "draft", limit: 200 }),
    listContent({ status: "archived", limit: 200 }),
  ]);

  return (
    <>
      <div className="ds-admin-head">
        <h1 className="ds-t-page">Drafts</h1>
        <Link href="/admin/content/new" className="ds-box ds-dark">
          New piece
        </Link>
      </div>

      <p className="ds-dek" style={{ marginBottom: 22, maxWidth: "60ch" }}>
        Nothing here is on the site. Publishing runs the editorial checks first and refuses if
        anything would render wrong.
      </p>

      <ContentTable rows={drafts.items} />

      {archived.items.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <span className="ds-kickq" style={{ marginBottom: 12 }}>
            Archived — off the site, still recoverable
          </span>
          <ContentTable rows={archived.items} />
        </section>
      )}
    </>
  );
}
