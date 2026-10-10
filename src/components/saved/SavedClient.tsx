"use client";

import Link from "next/link";
import { Icon } from "@/components/site/icons";
import { useReader } from "@/components/site/ReaderProvider";
import { SignOutButton } from "@/components/site/SignOutButton";
import type { SavedEntry } from "@/lib/reader-selectors";
import s from "./saved.module.scss";

const GROUPS: { prefix: string; label: string }[] = [
  { prefix: "/blog", label: "Essays" },
  { prefix: "/explainers", label: "Explainers" },
  { prefix: "/learn", label: "Notes" },
];

function ago(ts: number) {
  const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function SavedClient() {
  const { signedIn, ready, saved, toggleSaved } = useReader();
  const items = [...saved].sort((a, b) => b.savedAt - a.savedAt);
  const count = items.length;

  if (ready && !signedIn) {
    return (
      <div className={`wrap ${s.page}`}>
        <div className={`darkCard ${s.gate}`}>
          <div className="glow" />
          <div className={s.gateText}>
            <span className="eyebrow">Saved</span>
            <b>Your reading queue lives on your account.</b>
          </div>
          <Link href="/signin?next=/saved" className="btnAccent">Sign in →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`wrap ${s.page}`}>
      <div className={s.head}>
        <div>
          <span className="eyebrow">Reading queue</span>
          <h1 className={s.h1}>Saved</h1>
        </div>
        {ready && <span className={`mono ${s.count}`}>{count} {count === 1 ? "item" : "items"}</span>}
      </div>

      {ready && (
        <div className={`card ${s.account}`}>
          <SignOutButton />
        </div>
      )}

      {!ready ? (
        <div aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className={s.skel} />)}</div>
      ) : count === 0 ? (
        <div className={`card ${s.empty}`}>
          <b>Nothing saved yet</b>
          <p>Tap the bookmark on any piece and it lands here.</p>
          <div className={s.emptyLinks}><Link href="/blog" className="btnPrimary">Browse essays</Link><Link href="/explainers" className="btnGhost">Explainers</Link></div>
        </div>
      ) : (
        GROUPS.map(({ prefix, label }) => {
          const list = items.filter((it) => it.href.startsWith(prefix));
          if (list.length === 0) return null;
          return (
            <section key={prefix} className={s.group}>
              <span className={`eyebrow ${s.groupH}`}>{label} · {list.length}</span>
              {list.map((it) => <Row key={it.slug} item={it} onRemove={() => void toggleSaved(it)} />)}
            </section>
          );
        })
      )}
    </div>
  );
}

function Row({ item, onRemove }: { item: SavedEntry; onRemove: () => void }) {
  return (
    <div className={`card ${s.row}`}>
      <div className={s.rowBody}>
        <Link href={item.href} className={s.rowTitle}>{item.title}</Link>
        {item.minutes > 0 && <span className={s.rowMeta}>{item.minutes} min</span>}
      </div>
      <span className={`mono ${s.rowTime}`}>added {ago(item.savedAt)}</span>
      <button type="button" className={s.remove} onClick={onRemove} aria-label={`Remove "${item.title}" from saved`} title="Remove">
        <Icon name="bookmark" size={15} fill="currentColor" />
      </button>
    </div>
  );
}
