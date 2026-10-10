"use client";

import { useRef, type ReactNode } from "react";

/** Cursor-reactive hero: sets --mx/--my (px, for the spotlight) and --px/--py (-0.5..0.5, for parallax) on the section. */
export function HeroFx({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const set = (vars: Record<string, string>) => {
    const el = ref.current;
    if (el) for (const k in vars) el.style.setProperty(k, vars[k]);
  };
  return (
    <section
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        set({ "--mx": `${x}px`, "--my": `${y}px`, "--px": (x / r.width - 0.5).toFixed(3), "--py": (y / r.height - 0.5).toFixed(3) });
      }}
      onMouseLeave={() => set({ "--mx": "-999px", "--my": "-999px", "--px": "0", "--py": "0" })}
    >
      {children}
    </section>
  );
}
