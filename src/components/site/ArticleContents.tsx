"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/headings";

/** The contents rail from screen 03, with the active section marked. */
export function ArticleContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const nav = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Only the top third counts as "current", so the mark tracks reading.
      { rootMargin: "0px 0px -66% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  // Follow the reader: whenever the marked section changes, bring it back into
  // view if the rail is taller than its own box.
  // biome-ignore lint/correctness/useExhaustiveDependencies: it must run on `active` alone
  useEffect(() => {
    const link = nav.current?.querySelector<HTMLElement>("a.on");
    const container = nav.current?.closest<HTMLElement>(".ds-reader-aside, .ds-lesson-toc");
    if (!link || !container) return;
    if (container.scrollHeight <= container.clientHeight + 4) return;

    const target = link.offsetTop - container.clientHeight / 2 + link.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  if (headings.length === 0) return null;

  return (
    <nav className="ds-contents" aria-label="Contents" ref={nav}>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={active === heading.id ? "on" : undefined}
          style={heading.level === 3 ? { paddingLeft: 12 } : undefined}
          aria-current={active === heading.id ? "location" : undefined}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
