import Image from "next/image";
import Link from "next/link";
import { editorial, person, routes } from "@/resources";
import { SavedCount } from "./SavedCount";
import { SearchTrigger } from "./SearchTrigger";
import { ThemeSwitch } from "./ThemeSwitch";

export type Section = "writing" | "explainers" | "learn" | "about" | null;

const NAV: Array<{ key: Exclude<Section, null>; label: string; href: string; route: string }> = [
  { key: "writing", label: "Writing", href: "/blog", route: "/blog" },
  { key: "explainers", label: "Explainers", href: "/explainers", route: "/explainers" },
  { key: "learn", label: "Learn", href: "/learn", route: "/learn" },
  { key: "about", label: "About", href: "/about", route: "/about" },
];

/** Which nav item a section root like "/blog" lights up. `/work` has none. */
export function sectionForRoute(route: string): Section {
  return NAV.find((item) => item.route === route)?.key ?? null;
}

/**
 * One masthead for every page: compact, sticky, and carrying its own rule so
 * the divider travels with it instead of scrolling away. `trailing` is where a
 * page hangs its own controls — the reader's progress and Save button — so an
 * article keeps the same header as everywhere else instead of swapping in one
 * of its own.
 */
export function Masthead({ current, trailing }: { current: Section; trailing?: React.ReactNode }) {
  const items = NAV.filter((item) => routes[item.route as keyof typeof routes] !== false);

  return (
    <header className="ds-masthead">
      <Link href="/" className="ds-brand">
        <span className="ds-brand-mark">
          <Image src="/icon.png" alt="" width={64} height={64} priority />
        </span>
        <span>
          <span className="ds-wordmark">{person.name.toLowerCase()}</span>
          <span className="ds-kickq ds-masthead-hide">{editorial.tagline}</span>
        </span>
      </Link>

      <nav className="ds-nav" aria-label="Sections">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={current === item.key ? "on" : undefined}
            aria-current={current === item.key ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        {trailing}
        <SearchTrigger />
        <SavedCount />
        <ThemeSwitch />
      </nav>
    </header>
  );
}
