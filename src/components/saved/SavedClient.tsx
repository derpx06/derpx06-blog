"use client";

import Link from "next/link";
import { useSaved, useSignIn, type SavedItem, type SavedKind } from "@/lib/user-data";
import { Icon } from "@/components/site/icons";
import s from "./saved.module.scss";

const GROUPS: { kind: SavedKind; label: string }[] = [
  { kind: "article", label: "Essays" },
  { kind: "explainer", label: "Explainers" },
  { kind: "lesson", label: "Notes" },
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
  const { signedIn, ready, items, count, toggle } = useSaved();
  const signIn = useSignIn();

  if (!signedIn) {
    return (
      <div className={`wrap ${s.page}`}>
        <div className={`darkCard ${s.gate}`}>
          <div className="glow" />
          <div className={s.gateText}>
            <span className="eyebrow">Saved</span>
            <b>Your reading queue lives on your account.</b>
          </div>
          <button type="button" className="btnAccent" onClick={signIn}>Sign in →</button>
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

      {!ready ? (
        <div aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className={s.skel} />)}</div>
      ) : count === 0 ? (
        <div className={`card ${s.empty}`}>
          <b>Nothing saved yet</b>
          <p>Tap the bookmark on any piece and it lands here.</p>
          <div className={s.emptyLinks}><Link href="/blog" className="btnPrimary">Browse essays</Link><Link href="/explainers" className="btnGhost">Explainers</Link></div>
        </div>
      ) : (
        GROUPS.map(({ kind, label }) => {
          const list = items.filter((it) => it.kind === kind);
          if (list.length === 0) return null;
          return (
            <section key={kind} className={s.group}>
              <span className={`eyebrow ${s.groupH}`}>{label} · {list.length}</span>
              {list.map((it) => <Row key={`${it.kind}:${it.slug}`} item={it} onRemove={() => toggle(it)} />)}
            </section>
          );
        })
      )}
    </div>
  );
}

function Row({ item, onRemove }: { item: SavedItem; onRemove: () => void }) {
  return (
    <div className={`card ${s.row}`}>
      <div className={s.rowBody}>
        <Link href={item.href} className={s.rowTitle}>{item.title}</Link>
        {item.meta && <span className={s.rowMeta}>{item.meta}</span>}
      </div>
      <span className={`mono ${s.rowTime}`}>added {ago(item.added)}</span>
      <button type="button" className={s.remove} onClick={onRemove} aria-label={`Remove "${item.title}" from saved`} title="Remove">
        <Icon name="bookmark" size={15} fill="currentColor" />
      </button>
    </div>
  );
}
