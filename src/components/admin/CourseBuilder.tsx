"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useToast } from "@/components/site/toast";
import type { CourseStatus, CourseTopic } from "@/types/content.types";

/**
 * Topics and lessons for one course.
 *
 * Everything here rewrites the whole `topics` array, because lesson order *is*
 * array order — there is no position field to update in place. The server
 * re-validates references after every write, so the problem list below always
 * reflects what is actually stored.
 */

type Problem = { kind: string; topic?: string; lesson?: string; detail: string };

export type BuilderCourse = {
  slug: string;
  title: string;
  description: string;
  image: string;
  status: CourseStatus;
  topics: CourseTopic[];
};

export function CourseBuilder({
  course: initial,
  problems: initialProblems,
  availableLessons,
}: {
  course: BuilderCourse;
  problems: Problem[];
  availableLessons: string[];
}) {
  const router = useRouter();
  const { addToast } = useToast();

  const [course, setCourse] = useState(initial);
  const [problems, setProblems] = useState(initialProblems);
  const [saving, setSaving] = useState(false);

  const patch = useCallback(
    async (body: Record<string, unknown>, message?: string) => {
      setSaving(true);
      try {
        const response = await fetch(`/api/admin/courses/${initial.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save");

        setCourse((current) => ({ ...current, ...data.course }));
        setProblems(data.problems ?? []);
        if (message) addToast({ variant: "success", message });
        router.refresh();
      } catch (error) {
        addToast({
          variant: "danger",
          message: error instanceof Error ? error.message : "Could not save",
        });
      } finally {
        setSaving(false);
      }
    },
    [addToast, initial.slug, router],
  );

  /** Every structural edit is a local array transform, then one write. */
  const writeTopics = (topics: CourseTopic[], message?: string) => {
    setCourse((current) => ({ ...current, topics }));
    return patch({ topics }, message);
  };

  const move = <T,>(items: T[], from: number, to: number): T[] => {
    if (to < 0 || to >= items.length) return items;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  };

  const addTopic = () => {
    const title = window.prompt("Topic name");
    if (!title?.trim()) return;
    writeTopics([...course.topics, { title: title.trim(), links: [] }], "Topic added.");
  };

  const addLesson = (topicIndex: number) => {
    const slug = window.prompt(
      "Which learn piece?\n\nEnter its slug — it must be a published piece in the learn section.",
    );
    if (!slug?.trim()) return;

    const clean = slug.trim();
    const title = window.prompt("Lesson title", clean) ?? clean;

    writeTopics(
      course.topics.map((topic, index) =>
        index === topicIndex
          ? {
              ...topic,
              links: [
                ...topic.links,
                { title: title.trim() || clean, slug: clean, postSlugs: [clean] },
              ],
            }
          : topic,
      ),
      "Lesson added.",
    );
  };

  const errorCount = problems.length;

  return (
    <>
      <div className="ds-admin-head">
        <div>
          <h1 className="ds-t-page">{course.title}</h1>
          <span className="ds-meta ds-meta-s">
            /learn/{course.slug} ·{" "}
            <span className={`ds-badge ds-badge-${course.status}`}>{course.status}</span>
          </span>
        </div>
        <span style={{ display: "flex", gap: 8 }}>
          <Link href={`/learn/${course.slug}`} className="ds-box" target="_blank">
            View ↗
          </Link>
          {course.status === "published" ? (
            <button
              type="button"
              className="ds-box"
              disabled={saving}
              onClick={() => patch({ status: "draft" }, "Unpublished.")}
            >
              Unpublish
            </button>
          ) : (
            <button
              type="button"
              className="ds-box ds-dark"
              disabled={saving}
              onClick={() => patch({ status: "published" }, "Published.")}
            >
              Publish
            </button>
          )}
        </span>
      </div>

      {/* ------------------------------------------------------- metadata */}
      <section style={{ maxWidth: 620, marginBottom: 34 }}>
        <div className="ds-field-row">
          <label htmlFor="c-title">Title</label>
          <input
            id="c-title"
            className="ds-field"
            value={course.title}
            onChange={(event) => setCourse({ ...course, title: event.target.value })}
            onBlur={() => patch({ title: course.title })}
            style={{ flex: "none" }}
          />
        </div>
        <div className="ds-field-row">
          <label htmlFor="c-desc">Description</label>
          <textarea
            id="c-desc"
            className="ds-field"
            value={course.description}
            onChange={(event) => setCourse({ ...course, description: event.target.value })}
            onBlur={() => patch({ description: course.description })}
          />
        </div>
        <div className="ds-field-row">
          <label htmlFor="c-image">Cover image</label>
          <input
            id="c-image"
            className="ds-field"
            value={course.image}
            onChange={(event) => setCourse({ ...course, image: event.target.value })}
            onBlur={() => patch({ image: course.image })}
            placeholder="/images/learn/…"
            style={{ flex: "none" }}
          />
        </div>
      </section>

      {/* ------------------------------------------------------- problems */}
      {errorCount > 0 && (
        <section style={{ marginBottom: 26 }}>
          <span className="ds-kickq" style={{ marginBottom: 10 }}>
            {errorCount} thing{errorCount === 1 ? "" : "s"} to fix
          </span>
          <div className="ds-checks">
            {problems.map((problem) => (
              <div key={problem.detail} className="ds-check ds-check-error">
                <code>{problem.kind}</code>
                <span>{problem.detail}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- topics */}
      <div className="ds-admin-head">
        <span className="ds-kickq">Topics and lessons — order here is the order readers get</span>
        <button type="button" className="ds-box" onClick={addTopic} disabled={saving}>
          Add topic
        </button>
      </div>

      {course.topics.length === 0 && <p className="ds-meta">No topics yet.</p>}

      {course.topics.map((topic, topicIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: topics have no id, and including the index is what forces a remount on reorder so the controlled inputs re-read their new values
        <div className="ds-topic" key={`topic-${topicIndex}-${topic.title}`}>
          <div className="ds-topic-head">
            <input
              className="ds-field"
              value={topic.title}
              onChange={(event) =>
                setCourse({
                  ...course,
                  topics: course.topics.map((t, i) =>
                    i === topicIndex ? { ...t, title: event.target.value } : t,
                  ),
                })
              }
              onBlur={() => patch({ topics: course.topics })}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="ds-mini"
              disabled={saving || topicIndex === 0}
              onClick={() => writeTopics(move(course.topics, topicIndex, topicIndex - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className="ds-mini"
              disabled={saving || topicIndex === course.topics.length - 1}
              onClick={() => writeTopics(move(course.topics, topicIndex, topicIndex + 1))}
            >
              ↓
            </button>
            <button type="button" className="ds-mini" onClick={() => addLesson(topicIndex)}>
              + Lesson
            </button>
            <button
              type="button"
              className="ds-mini ds-mini-danger"
              disabled={saving}
              onClick={() => {
                if (
                  topic.links.length > 0 &&
                  !window.confirm(
                    `Remove "${topic.title}" and its ${topic.links.length} lesson(s)?`,
                  )
                )
                  return;
                writeTopics(
                  course.topics.filter((_, i) => i !== topicIndex),
                  "Topic removed.",
                );
              }}
            >
              Remove
            </button>
          </div>

          {topic.links.length === 0 && (
            <div className="ds-lesson">
              <span className="ds-meta ds-meta-s">No lessons in this topic.</span>
            </div>
          )}

          {topic.links.map((link, lessonIndex) => {
            const missing = link.postSlugs.some((slug) => !availableLessons.includes(slug));

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: lesson slugs can legitimately collide while a duplicate is being fixed, so position is the only stable identity here
              <div className="ds-lesson" key={`lesson-${lessonIndex}-${link.slug}`}>
                <span className="ds-lesson-title">
                  {link.title}
                  <span>
                    {link.postSlugs.join(", ") || "no content"}
                    {missing && " · not published"}
                  </span>
                </span>
                {missing && <span className="ds-badge ds-badge-archived">broken</span>}
                <Link className="ds-mini" href={`/admin/content/learn/${link.postSlugs[0] ?? ""}`}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="ds-mini"
                  disabled={saving || lessonIndex === 0}
                  onClick={() =>
                    writeTopics(
                      course.topics.map((t, i) =>
                        i === topicIndex
                          ? { ...t, links: move(t.links, lessonIndex, lessonIndex - 1) }
                          : t,
                      ),
                    )
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ds-mini"
                  disabled={saving || lessonIndex === topic.links.length - 1}
                  onClick={() =>
                    writeTopics(
                      course.topics.map((t, i) =>
                        i === topicIndex
                          ? { ...t, links: move(t.links, lessonIndex, lessonIndex + 1) }
                          : t,
                      ),
                    )
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="ds-mini ds-mini-danger"
                  disabled={saving}
                  onClick={() =>
                    writeTopics(
                      course.topics.map((t, i) =>
                        i === topicIndex
                          ? { ...t, links: t.links.filter((_, j) => j !== lessonIndex) }
                          : t,
                      ),
                      "Lesson removed from the course.",
                    )
                  }
                  title="Removes it from the course. The piece itself stays."
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
