"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { CourseSidebar } from "@/components/CourseSidebar";
import type { Course } from "@/types";

/** The lesson reader shell: syllabus rail on desktop, drawer on small screens. */
export default function CourseMobileControls({
  course,
  children,
}: {
  course: Course;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="ds-lesson-shell">
      <button
        type="button"
        className="ds-lesson-menu"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close lessons menu" : "Open lessons menu"}
      >
        <Menu size={18} />
        Lessons
      </button>

      {open && (
        <button
          type="button"
          className="ds-lesson-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close lessons menu"
        />
      )}

      <CourseSidebar course={course} mobileOpen={open} onClose={() => setOpen(false)} />
      <div className="ds-lesson-main">{children}</div>
    </div>
  );
}
