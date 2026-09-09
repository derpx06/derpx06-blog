import Link from "next/link";
import { NewCourseButton } from "@/components/admin/NewCourseButton";
import { listCoursesForAdmin, validateCourseReferences } from "@/lib/admin/course-writes";
import { getContentList } from "@/lib/content-repository";

export default async function CoursesPage() {
  const [courses, learn] = await Promise.all([listCoursesForAdmin(), getContentList("learn")]);
  const available = new Set(learn.map((record) => record.slug));

  return (
    <>
      <div className="ds-admin-head">
        <h1 className="ds-t-page">Courses</h1>
        <NewCourseButton />
      </div>

      <p className="ds-dek" style={{ marginBottom: 22, maxWidth: "62ch" }}>
        A lesson points at a piece in the <strong>learn</strong> section by slug. Write the lesson
        body under Content, then attach it here.
      </p>

      {courses.length === 0 && <p className="ds-meta">No courses yet.</p>}

      <table className="ds-admin-table">
        <thead>
          <tr>
            <th>Course</th>
            <th>Status</th>
            <th>Lessons</th>
            <th>Problems</th>
            <th>Edited</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const problems = validateCourseReferences(course.topics, available);
            return (
              <tr key={course.slug}>
                <td>
                  <Link href={`/admin/courses/${course.slug}`}>{course.title}</Link>
                  <span className="ds-meta ds-meta-s" style={{ display: "block" }}>
                    /learn/{course.slug}
                  </span>
                </td>
                <td>
                  <span className={`ds-badge ds-badge-${course.status}`}>{course.status}</span>
                </td>
                <td className="ds-meta ds-meta-s">
                  {course.lessonCount} in {course.topics.length} topic
                  {course.topics.length === 1 ? "" : "s"}
                </td>
                <td className="ds-meta ds-meta-s">
                  {problems.length === 0 ? (
                    "—"
                  ) : (
                    <span style={{ color: "var(--acc)" }}>{problems.length}</span>
                  )}
                </td>
                <td className="ds-meta ds-meta-s">
                  {course.updatedAt ? course.updatedAt.slice(0, 10) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
