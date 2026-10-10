"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { person, routes } from "@/resources";
import { useReader } from "./ReaderProvider";
import { useTheme } from "./theme";
import { Icon } from "./icons";
import s from "./SiteNav.module.scss";

const NAV = [
  ["Writing", "/blog"],
  ["Explainers", "/explainers"],
  ["Notes", "/learn"],
  ["About", "/about"],
] as const;

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

/** Fixed nav: a full-width bar at the top of the page, a floating frosted capsule once scrolled. */
export function SiteNav() {
  const pathname = usePathname() || "/";
  const { ready, signedIn, user, isAdmin, saved } = useReader();
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [account, setAccount] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeAll = () => { setMenu(false); setAccount(false); };
  const ref = useOutsideClose(menu || account, closeAll);

  useEffect(() => { setMounted(true); }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: close both menus on navigation
  useEffect(() => { setMenu(false); setAccount(false); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const items = NAV.filter(([, href]) => routes[href as keyof typeof routes] !== false);
  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined);
  const count = signedIn ? saved.length : 0;
  const dark = mounted && theme === "dark";
  const signOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/"); };

  return (
    <div className={s.fixed}>
      <div className={`wrap ${s.inner} ${scrolled ? s.capsule : s.bar}`} ref={ref}>
        <nav className={s.nav} aria-label="Primary">
          <Link href="/" className={s.brand} aria-label={`${person.name} home`}>
            <Image className={s.mark} src={person.avatar} alt="" width={38} height={38} priority />
            <span>derpx06<em>.</em>dev</span>
          </Link>

          <div className={s.links}>
            {items.map(([label, href]) => (
              <Link key={href} href={href} className={s.link} aria-current={current(href)}>{label}</Link>
            ))}
          </div>

          <div className={s.right}>
            <button type="button" className={s.iconBtn} onClick={() => window.dispatchEvent(new CustomEvent("derpx06:search"))} aria-label="Search (⌘K)" title="Search ⌘K">
              <Icon name="search" size={17} />
            </button>
            <button type="button" className={s.iconBtn} onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}>
              {mounted ? <Icon name={dark ? "sun" : "moon"} size={17} /> : <span style={{ width: 17, height: 17 }} />}
            </button>
            <Link href="/saved" className={s.iconBtn} aria-current={current("/saved")} aria-label={`Saved, ${count} items`} title="Saved">
              <Icon name="bookmark" size={17} />
              {count > 0 && <span className={s.badge}>{count > 99 ? "99+" : count}</span>}
            </Link>
            <span className={s.sep} />
            {!ready ? (
              <span style={{ width: 42, height: 42 }} />
            ) : signedIn && user ? (
              <button type="button" className={s.avatarBtn} onClick={() => { setAccount((v) => !v); setMenu(false); }} aria-expanded={account} aria-haspopup="menu" aria-label="Account menu">
                <span className={s.initial}>{(user.name || user.email).trim().charAt(0).toUpperCase()}</span>
              </button>
            ) : (
              <Link href={`/signin?next=${encodeURIComponent(pathname)}`} className={s.cta}>
                <span>Sign in</span><Icon name="arrowRight" size={13} strokeWidth={2.5} />
              </Link>
            )}
            <button type="button" className={s.menuBtn} onClick={() => { setMenu((v) => !v); setAccount(false); }} aria-expanded={menu} aria-label="Menu">
              <Icon name={menu ? "x" : "menu"} size={17} />
            </button>
          </div>
        </nav>

        {menu && (
          <div className={`${s.dropdown} ${s.full}`} role="menu">
            {items.map(([label, href]) => (
              <Link key={href} href={href} className={s.item} role="menuitem" aria-current={current(href)}>{label}<span className={s.dot} /></Link>
            ))}
            <Link href="/saved" className={s.item} role="menuitem" aria-current={current("/saved")}>Saved{count > 0 && <span className="mono" style={{ fontSize: 11 }}>{count}</span>}</Link>
          </div>
        )}
        {account && user && (
          <div className={s.dropdown} role="menu">
            <div className={s.who}>{user.email}</div>
            <Link href="/saved" className={s.item} role="menuitem">Saved<Icon name="bookmark" size={14} /></Link>
            <Link href="/learn" className={s.item} role="menuitem">My progress<Icon name="check" size={14} /></Link>
            {isAdmin && <Link href="/admin" className={s.item} role="menuitem">Admin<Icon name="arrowRight" size={14} /></Link>}
            <button type="button" className={s.item} role="menuitem" onClick={signOut}>Sign out<Icon name="logout" size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
