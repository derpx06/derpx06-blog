"use client";

import { useRouter } from "next/navigation";
import { useReader } from "./ReaderProvider";
import { useToast } from "./toast";

export type SaveTarget = { slug: string; href: string; title: string; minutes: number };

/**
 * `italic` matches the archive rows in the design ("Save" / "Saved ✓");
 * `box` matches the button pair on the lead article and the reader header.
 */
export function SaveButton({
  piece,
  variant = "box",
}: {
  piece: SaveTarget;
  variant?: "box" | "italic";
}) {
  const { ready, signedIn, saved, toggleSaved } = useReader();
  const { addToast } = useToast();
  const router = useRouter();

  const isSaved = saved.some((item) => item.slug === piece.slug);

  const onClick = () => {
    if (!signedIn) {
      addToast({ message: "Sign in to save pieces for later.", variant: "danger" });
      router.push(`/signin?next=${encodeURIComponent(piece.href)}`);
      return;
    }
    void toggleSaved(piece);
  };

  const label = isSaved ? "Saved ✓" : "Save";

  if (variant === "italic") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isSaved}
        disabled={!ready}
        className="ds-save-italic"
        style={{ color: isSaved ? "var(--acc)" : undefined }}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSaved}
      disabled={!ready}
      className="ds-box"
    >
      {label}
    </button>
  );
}
