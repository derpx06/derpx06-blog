"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/site/icons";
import { useReader } from "@/components/site/ReaderProvider";
import type { SaveTarget } from "@/components/site/SaveButton";
import { useToast } from "@/components/site/toast";
import s from "./listing.module.scss";

/** Icon-only Save toggle with the same contract as `SaveButton`. */
export function SaveIcon({ piece }: { piece: SaveTarget }) {
  const { ready, signedIn, saved, toggleSaved } = useReader();
  const { addToast } = useToast();
  const router = useRouter();
  const on = saved.some((item) => item.slug === piece.slug);
  const label = on ? "Saved" : "Save for later";
  const onClick = () => {
    if (!signedIn) {
      addToast({ message: "Sign in to save pieces for later.", variant: "danger" });
      router.push(`/signin?next=${encodeURIComponent(piece.href)}`);
      return;
    }
    void toggleSaved(piece);
  };
  return (
    <button
      type="button"
      className={`${s.saveIcon} ${on ? s.saveIconOn : ""}`}
      onClick={onClick}
      disabled={!ready}
      aria-pressed={on}
      aria-label={label}
      title={label}
    >
      <Icon name="bookmark" size={14} fill={on ? "currentColor" : "none"} />
    </button>
  );
}
