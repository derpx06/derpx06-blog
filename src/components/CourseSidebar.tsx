"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReader } from "@/components/site/ReaderProvider";
import { courseStanding } from "@/lib/reader-selectors";
import type { Course } from "@/types";

interface CourseSidebarProps {
  course: Course;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function CourseSidebar({ course, mobileOpen = false, onClose }: CourseSidebarProps) {
  const pathname = usePathname() ?? "";
  const pending = useRef<string | null>(null);
  const { ready, lessons } = useReader();
  const done = ready ? (lessons[course.slug]?.done ?? []) : [];
  const flat = course.topics.flatMap((topic) => topic.links);
  const standing = courseStanding(flat, done);

  useEffect(() => {
    if (pending.current && pathname.includes(pending.current)) {
      pending.current = null;
      onClose?.();
    }
  }, [pathname, onClose]);

  let index = 0;

  return (
    <nav
      className={`ds-lesson-nav${mobileOpen ? " is-open" : ""}`}
      aria-label={`${course.title} lessons`}
    >
      <div className="ds-lesson-nav-head">
        <Link href={`/learn/${course.slug}`} className="ds-t-s ds-plain-link">
          {course.title}
        </Link>
        <button type="button" className="ds-lesson-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <div className="ds-lesson-progress">
        <div className="ds-between ds-meta ds-meta-s">
          <span>Progress</span>
          <span>
            {standing.doneCount} of {flat.length}
          </span>
        </div>
        <div className="ds-bar" style={{ height: 4, marginTop: 7 }}>
          <i style={{ width: `${standing.percent}%` }} />
        </div>
      </div>

      {course.topics.map((topic) => (
        <section key={topic.title} className="ds-lesson-part">
          <span className="ds-kickq">{topic.title}</span>
          <div className="ds-stack">
            {topic.links.map((link) => {
              index += 1;
              const href = `/learn/${course.slug}/${link.slug}`;
              const active = pathname.replace(/\/$/, "") === href;
              return (
                <Link
                  key={link.slug}
                  href={href}
                  className={`ds-lesson-link${active ? " on" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    pending.current = link.slug;
                  }}
                >
                  <span className="ds-lesson-index">{index}</span>
                  <span className="ds-lesson-title">{link.title}</span>
                  {done.includes(link.slug) && (
                    <span className="ds-lesson-done" role="img" aria-label="completed">
                      ✓
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
