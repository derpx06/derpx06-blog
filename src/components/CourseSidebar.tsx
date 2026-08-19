"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Course } from "@/types";
import { useReader } from "@/components/site/ReaderProvider";

interface CourseSidebarProps {
  course: Course;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function CourseSidebar({ course, mobileOpen = false, onClose }: CourseSidebarProps) {
  const pathname = usePathname() ?? "";
  const pending = useRef<string | null>(null);
  const { lessons } = useReader();
  const done = lessons[course.slug]?.done ?? [];

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
                    <span className="ds-lesson-done" aria-label="completed">
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
