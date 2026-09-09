import Link from "next/link";
import { ContentTable } from "@/components/admin/ContentTable";
import { listContent, SECTIONS, STATUSES } from "@/lib/admin/content-writes";
import type { ContentSection, ContentStatus } from "@/types/content.types";

/** Everything, filterable. The filters are links so the view is shareable. */
export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const section = SECTIONS.includes(params.section as ContentSection)
    ? (params.section as ContentSection)
    : undefined;
  const status = STATUSES.includes(params.status as ContentStatus)
    ? (params.status as ContentStatus)
    : undefined;

  const { items, total } = await listContent({
    section,
    status,
    search: params.search?.trim() || undefined,
    limit: 200,
  });

  const link = (next: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    const merged = { section, status, search: params.search, ...next };
    for (const [key, value] of Object.entries(merged)) {
      if (value) query.set(key, value);
    }
    const string = query.toString();
    return `/admin/content${string ? `?${string}` : ""}`;
  };

  return (
    <>
      <div className="ds-admin-head">
        <h1 className="ds-t-page">Content</h1>
        <Link href="/admin/content/new" className="ds-box ds-dark">
          New piece
        </Link>
      </div>

      <div className="ds-admin-filters">
        <Link
          href={link({ section: undefined })}
          className={`ds-admin-chip${!section ? " is-on" : ""}`}
        >
          All sections
        </Link>
        {SECTIONS.map((value) => (
          <Link
            key={value}
            href={link({ section: value })}
            className={`ds-admin-chip${section === value ? " is-on" : ""}`}
          >
            {value}
          </Link>
        ))}
      </div>

      <div className="ds-admin-filters">
        <Link
          href={link({ status: undefined })}
          className={`ds-admin-chip${!status ? " is-on" : ""}`}
        >
          Any status
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={link({ status: value })}
            className={`ds-admin-chip${status === value ? " is-on" : ""}`}
          >
            {value}
          </Link>
        ))}
      </div>

      <form className="ds-admin-filters" action="/admin/content" method="get">
        {section && <input type="hidden" name="section" value={section} />}
        {status && <input type="hidden" name="status" value={status} />}
        <input
          className="ds-field"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search titles, slugs and summaries"
          style={{ flex: "0 1 320px" }}
        />
        <button type="submit" className="ds-admin-chip">
          Search
        </button>
      </form>

      <p className="ds-meta ds-meta-s" style={{ marginBottom: 12 }}>
        {total} piece{total === 1 ? "" : "s"}
      </p>

      <ContentTable rows={items} />
    </>
  );
}
