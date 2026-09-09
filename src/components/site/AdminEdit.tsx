"use client";

import Link from "next/link";
import { useReader } from "./ReaderProvider";

/**
 * The "edit this" shortcut, shown only to admins. It rides the one
 * `/api/reader/state` fetch every page already makes, so the prerendered HTML
 * is identical for everybody and the site stays static.
 */
export function AdminEdit({
  href,
  label = "Edit",
  variant = "box",
}: {
  href: string;
  label?: string;
  /** "box" sits in the masthead beside Save and Search; "mini" inside a page. */
  variant?: "box" | "mini";
}) {
  const { isAdmin, ready } = useReader();
  if (!ready || !isAdmin) return null;

  return (
    <Link className={variant === "box" ? "ds-box" : "ds-mini"} href={href} prefetch={false}>
      {label}
    </Link>
  );
}
