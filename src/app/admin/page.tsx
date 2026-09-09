import Link from "next/link";
import { countByStatus, listContent } from "@/lib/admin/content-writes";
import { listCoursesForAdmin, validateCourseReferences } from "@/lib/admin/course-writes";
import { getContentList } from "@/lib/content-repository";

const SECTIONS = ["blog", "explainers", "learn", "work"] as const;

/** The overview: what exists, what is unfinished, and what is broken. */
export default async function AdminOverview() {
  const [counts, recent, drafts, courses, learn] = await Promise.all([
    countByStatus(),
    listContent({ limit: 8 }),
    listContent({ status: "draft", limit: 1 }),
    listCoursesForAdmin(),
    getContentList("learn"),
  ]);

  const learnSlugs = new Set(learn.map((record) => record.slug));
  const broken = courses.flatMap((course) =>
    validateCourseReferences(course.topics, learnSlugs).map((problem) => ({
      course: course.title,
      slug: course.slug,
      ...problem,
    })),
  );

  return (
    <>
      <div className="ds-admin-head">
        <h1 className="ds-t-page">Overview</h1>
        <Link href="/admin/content/new" className="ds-box ds-dark">
          New piece
        </Link>
      </div>

      <table className="ds-admin-table" style={{ marginBottom: 34, maxWidth: 560 }}>
        <thead>
          <tr>
            <th>Section</th>
            <th>Published</th>
            <th>Draft</th>
            <th>Archived</th>
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section) => (
            <tr key={section}>
              <td>
                <Link href={`/admin/content?section=${section}`}>{section}</Link>
              </td>
              <td>{counts[section]?.published ?? 0}</td>
              <td>{counts[section]?.draft ?? 0}</td>
              <td>{counts[section]?.archived ?? 0}</td>
            </tr>
          ))}
          <tr>
            <td>
              <Link href="/admin/courses">courses</Link>
            </td>
            <td>{courses.filter((course) => course.status === "published").length}</td>
            <td>{courses.filter((course) => course.status === "draft").length}</td>
            <td>{courses.filter((course) => course.status === "archived").length}</td>
          </tr>
        </tbody>
      </table>

      {broken.length > 0 && (
        <section style={{ marginBottom: 34 }}>
          <span className="ds-kickq" style={{ marginBottom: 12 }}>
            Broken course references
          </span>
          <div className="ds-checks">
            {broken.slice(0, 10).map((problem) => (
              <div key={`${problem.slug}-${problem.detail}`} className="ds-check ds-check-error">
                <code>{problem.course}</code>
                <span>
                  {problem.detail} — <Link href={`/admin/courses/${problem.slug}`}>fix</Link>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="ds-admin-head">
          <span className="ds-kickq">Recently edited</span>
          {drafts.total > 0 && (
            <Link href="/admin/drafts" className="ds-meta ds-meta-s">
              {drafts.total} draft{drafts.total === 1 ? "" : "s"} waiting →
            </Link>
          )}
        </div>
        <table className="ds-admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Section</th>
              <th>Status</th>
              <th>Edited</th>
            </tr>
          </thead>
          <tbody>
            {recent.items.map((item) => (
              <tr key={`${item.section}/${item.slug}`}>
                <td>
                  <Link href={`/admin/content/${item.section}/${item.slug}`}>{item.title}</Link>
                </td>
                <td className="ds-meta ds-meta-s">{item.section}</td>
                <td>
                  <span className={`ds-badge ds-badge-${item.status}`}>{item.status}</span>
                </td>
                <td className="ds-meta ds-meta-s">
                  {item.updatedAt ? item.updatedAt.slice(0, 10) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
