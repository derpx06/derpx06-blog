import type { JSX } from "react";
import styles from "@/components/HeadingLink.module.scss";

interface HeadingLinkProps {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
}

/** Heading with an anchor that appears on hover. Clicking the heading text does nothing surprising. */
export function HeadingLink({ id, level, children }: HeadingLinkProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag id={id} className={styles.heading}>
      {children}
      <a href={`#${id}`} className={styles.anchor} aria-label="Link to this section">#</a>
    </Tag>
  );
}
