"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/site/toast";

/** Creates a draft course and opens its builder. */
export function NewCourseButton() {
  const router = useRouter();
  const { addToast } = useToast();
  const [busy, setBusy] = useState(false);

  const create = async () => {
    const title = window.prompt("Course title");
    if (!title?.trim()) return;

    setBusy(true);
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create the course");

      router.push(`/admin/courses/${data.course.slug}`);
    } catch (error) {
      addToast({
        variant: "danger",
        message: error instanceof Error ? error.message : "Could not create the course",
      });
      setBusy(false);
    }
  };

  return (
    <button type="button" className="ds-box ds-dark" onClick={create} disabled={busy}>
      {busy ? "Creating…" : "New course"}
    </button>
  );
}
