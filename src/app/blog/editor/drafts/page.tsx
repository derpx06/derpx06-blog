import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getContentDrafts } from "@/lib/content-repository";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";

export default async function DraftsPage() {
  const requestHeaders = await headers();
  if (!isLocalArticleEditorHost(requestHeaders.get("host"))) notFound();

  const drafts = await getContentDrafts("blog");

  return (
    <main id="main" style={{ padding: "38px var(--gut) 60px" }}>
      <div className="ds-between" style={{ marginBottom: 22 }}>
        <h1 className="ds-t-page">Drafts</h1>
        <Link href="/blog/editor" className="ds-box ds-dark">
          New piece
        </Link>
      </div>

      {drafts.length === 0 ? (
        <p className="ds-dek">No drafts yet.</p>
      ) : (
        <div className="ds-stack">
          {drafts.map((draft, index) => (
            <div
              key={draft.slug}
              className="ds-item"
              style={{
                borderBottom: index === drafts.length - 1 ? "1px solid var(--rule-strong)" : undefined,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  href={`/blog/editor?slug=${encodeURIComponent(draft.slug)}`}
                  className="ds-t-s ds-plain-link"
                >
                  {draft.metadata.title || draft.slug}
                </Link>
                {draft.metadata.summary && (
                  <p className="ds-dek" style={{ fontSize: 14, marginTop: 4 }}>
                    {draft.metadata.summary}
                  </p>
                )}
              </div>
              <span className="ds-meta ds-meta-s">{draft.slug}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
