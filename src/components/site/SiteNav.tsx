"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@once-ui-system/core";
import { useSaved } from "@/lib/user-data";
import { Icon } from "./icons";
import s from "./SiteNav.module.scss";

const NAV = [
  ["Writing", "/blog"],
  ["Explainers", "/explainers"],
  ["Notes", "/learn"],
  ["About", "/about"],
] as const;

function useResolvedTheme() {
  const { theme, setTheme } = useTheme();
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    const read = () => setDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [theme]);
  return { dark, toggle: () => setTheme(dark ? "light" : "dark") };
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

export function SiteNav() {
  const pathname = usePathname() || "/";
  const { data: session, status } = useSession();
  const { count } = useSaved();
  const { dark, toggle } = useResolvedTheme();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const [user, setUser] = useState(false);
  const closeAll = () => { setMenu(false); setUser(false); };
  const ref = useOutsideClose(menu || user, closeAll);

  // close on navigation
  useEffect(() => { setMenu(false); setUser(false); }, [pathname]);

  const current = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "page" : undefined;

  return (
    <div className={s.fixed}>
      <div className={`wrap ${s.inner} ${scrolled ? s.capsule : s.bar}`} ref={ref}>
        <nav className={s.nav} aria-label="Primary">
          <Link href="/" className={s.brand} aria-label="derpx06.dev home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.mark} src="/images/derpx06-avatar.png" alt="" width={38} height={38} />
            <span>derpx06<em>.</em>dev</span>
          </Link>

          <div className={s.links}>
            {NAV.map(([label, href]) => (
              <Link key={href} href={href} className={s.link} aria-current={current(href)}>{label}</Link>
            ))}
          </div>

          <div className={s.right}>
            <button type="button" className={s.iconBtn} onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}>
              {dark === null ? <span style={{ width: 17, height: 17 }} /> : <Icon name={dark ? "sun" : "moon"} size={17} />}
            </button>
            <Link href="/saved" className={s.iconBtn} aria-current={current("/saved")} aria-label={`Saved, ${count} items`} title="Saved">
              <Icon name="bookmark" size={17} />
              {count > 0 && <span className={s.badge}>{count > 99 ? "99+" : count}</span>}
            </Link>
            <span className={s.sep} />
            {status === "authenticated" && session?.user ? (
              <button type="button" className={s.avatarBtn} onClick={() => { setUser((v) => !v); setMenu(false); }} aria-expanded={user} aria-haspopup="menu" aria-label="Account menu">
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={s.avatar} src={session.user.image} alt="" referrerPolicy="no-referrer" />
                ) : (
                  <Icon name="user" size={18} />
                )}
              </button>
            ) : status === "loading" ? (
              <span style={{ width: 42, height: 42 }} />
            ) : (
              <Link href={`/signin?callbackUrl=${encodeURIComponent(pathname)}`} className={s.cta}>
                <span>Sign in</span><Icon name="arrowRight" size={13} strokeWidth={2.5} />
              </Link>
            )}
            <button type="button" className={s.menuBtn} onClick={() => { setMenu((v) => !v); setUser(false); }} aria-expanded={menu} aria-label="Menu">
              <Icon name={menu ? "x" : "menu"} size={17} />
            </button>
          </div>

        </nav>
          {menu && (
            <div className={`${s.dropdown} ${s.full}`} role="menu">
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className={s.item} role="menuitem" aria-current={current(href)}>{label}<span className={s.dot} /></Link>
              ))}
              <Link href="/saved" className={s.item} role="menuitem" aria-current={current("/saved")}>Saved{count > 0 && <span className="mono" style={{ fontSize: 11 }}>{count}</span>}</Link>
            </div>
          )}
          {user && session?.user && (
            <div className={s.dropdown} role="menu">
              <div className={s.who}>{session.user.email}</div>
              <Link href="/saved" className={s.item} role="menuitem">Saved<Icon name="bookmark" size={14} /></Link>
              <Link href="/learn" className={s.item} role="menuitem">My progress<Icon name="check" size={14} /></Link>
              <button type="button" className={s.item} role="menuitem" onClick={() => signOut({ callbackUrl: "/" })}>Sign out<Icon name="logout" size={14} /></button>
            </div>
          )}
      </div>
    </div>
  );
}
