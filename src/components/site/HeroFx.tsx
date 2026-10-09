"use client";

import { useRef, type ReactNode } from "react";

/** Cursor spotlight: sets --mx/--my on the section. Used on Home only. */
export function HeroFx({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const set = (x: string, y: string) => {
    ref.current?.style.setProperty("--mx", x);
    ref.current?.style.setProperty("--my", y);
  };
  return (
    <section
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        set(`${e.clientX - r.left}px`, `${e.clientY - r.top}px`);
      }}
      onMouseLeave={() => set("-999px", "-999px")}
    >
      {children}
    </section>
  );
}
