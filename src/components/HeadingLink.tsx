"use client";

import { Link2 } from "lucide-react";
import type { JSX } from "react";
import { useToast } from "@/components/site/toast";
import styles from "@/components/HeadingLink.module.scss";

type HeadingLinkProps = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
};

export const HeadingLink: React.FC<HeadingLinkProps> = ({ id, level, children }) => {
  const { addToast } = useToast();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const copyURL = () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(`${window.location.origin}${window.location.pathname}#${id}`)
      .then(
        () => addToast({ variant: "success", message: "Link copied to clipboard." }),
        () => addToast({ variant: "danger", message: "Failed to copy link." }),
      );
  };

  return (
    <Tag id={id} className={styles.control}>
      {children}
      <button
        type="button"
        className={styles.visibility}
        onClick={copyURL}
        aria-label="Copy link to this section"
      >
        <Link2 size={14} />
      </button>
    </Tag>
  );
};
