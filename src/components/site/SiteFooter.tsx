import Link from "next/link";
import { editorial, mailchimp, person } from "@/resources";
import { Icon } from "./icons";
import { FooterLetter, Wordmark } from "./SiteFooterClient";
import s from "./SiteFooter.module.scss";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const action = mailchimp.action && mailchimp.action.startsWith("https://") ? mailchimp.action : "";

  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.letter}>
          <div>
            <span className={s.kicker}>The weekly letter</span>
            <h2 className={s.letterH}>One piece a week on systems, models and learning.</h2>
            <p className={s.letterP}>No tracking, no sponsors. Unsubscribe in one click.</p>
          </div>
          <FooterLetter action={action} />
        </div>

        <div className={s.cols}>
          <div className={s.about}>
            <Link href="/" className={s.brand}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={person.avatar} alt="" width={28} height={28} /><span>derpx06<em>.</em>dev</span></Link>
            <span className={s.blurb}>{editorial.footerBlurb}</span>
            <div className={s.social}>
              <a href="https://github.com/derpx06" target="_blank" rel="noopener" aria-label="GitHub"><Icon name="github" /></a>
              <a href={`mailto:${person.email}`} aria-label="Email"><Icon name="mail" /></a>
            </div>
          </div>
          {editorial.footerColumns.map((col) => (
            <div key={col.title} className={s.col}>
              <span className={s.colH}>{col.title}</span>
              {col.links.map((l) =>
                l.external ? (
                  <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label}</a>
                ) : (
                  <Link key={l.href} href={l.href}>{l.label}</Link>
                ),
              )}
            </div>
          ))}
        </div>

        <Wordmark />
      </div>
      <div className={s.bar}>
        <div className="wrap" style={{ padding: 0 }}>
          <div className={s.barIn}>
            <span>© {year} {person.name}</span>
            <Link href="#main" className={s.top}>Back to top <Icon name="arrowUp" size={13} strokeWidth={2.2} /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
