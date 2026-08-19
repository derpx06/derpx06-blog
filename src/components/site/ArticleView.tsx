import Image from "next/image";
import Link from "next/link";
import { CustomMDX } from "@/components/mdx";
import { ArticleContents } from "./ArticleContents";
import { NewsletterBlock } from "./NewsletterBlock";
import { ReaderHeader } from "./ReaderHeader";
import type { Heading } from "@/lib/headings";
import { formatLongDate, type Piece } from "@/lib/site-data";
import { person } from "@/resources";

export type ArticleViewProps = {
  piece: Piece;
  body: string;
  headings: Heading[];
  /** Same-tag-first suggestions for the closing band. */
  related: Piece[];
  /** The piece to read next, shown in the in-article continuation block. */
  next: Piece | null;
  /** "Writing" or "Explainers" — the breadcrumb root. */
  sectionLabel: string;
  sectionHref: string;
  startHere: Piece[];
};

export function ArticleView({
  piece,
  body,
  headings,
  related,
  next,
  sectionLabel,
  sectionHref,
  startHere,
}: ArticleViewProps) {
  const target = {
    slug: piece.slug,
    href: piece.href,
    title: piece.title,
    minutes: piece.minutes,
    tag: piece.tag,
  };

  return (
    <main id="main">
      <ReaderHeader piece={target} sectionLabel={sectionLabel} sectionHref={sectionHref} />

      <div className="ds-reader">
        <aside className="ds-reader-aside ds-reader-left">
          <span className="ds-kickq" style={{ marginBottom: 16 }}>
            Contents
          </span>
          <ArticleContents headings={headings} />

          {next && (
            <>
              <div className="ds-rule" style={{ margin: "26px 0" }} />
              <span className="ds-kickq" style={{ marginBottom: 12 }}>
                Read next
              </span>
              <Link
                href={next.href}
                style={{ font: "400 14px/1.4 var(--ds-sans)", color: "var(--body)" }}
              >
                {next.title}
              </Link>
              <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 6 }}>
                {next.minutes} min · {next.tag}
              </span>
            </>
          )}
        </aside>

        <article className="ds-reader-main">
          <span className="ds-kick" style={{ marginBottom: 16 }}>
            {piece.tag} · {formatLongDate(piece.publishedAt)}
          </span>
          <h1 className="ds-t-hero" style={{ marginBottom: 16 }}>
            {piece.title}
          </h1>
          {piece.summary && (
            <p className="ds-dek" style={{ fontSize: 20, marginBottom: 22, color: "var(--ink)" }}>
              {piece.summary}
            </p>
          )}

          <div className="ds-byline">
            <span className="ds-byline-avatar">
              <Image src={person.avatar} alt="" width={34} height={34} sizes="34px" />
            </span>
            <span style={{ font: "600 13px/1 var(--ds-sans)" }}>{person.name}</span>
            <span className="ds-meta ds-meta-s">{piece.minutes} min read</span>
          </div>

          <div className="ds-prose ds-prose-dropcap">
            <CustomMDX source={body} />
          </div>

          {next && (
            <div className="ds-next-block">
              <span className="ds-kickq" style={{ marginBottom: 10 }}>
                Keep reading
              </span>
              <Link href={next.href} className="ds-t-m ds-plain-link">
                {next.title}
              </Link>
              <span className="ds-meta ds-meta-s" style={{ display: "block", marginTop: 6 }}>
                {next.minutes} min · {next.tag}
              </span>
            </div>
          )}
        </article>

        <aside className="ds-reader-aside ds-reader-right">
          {startHere.length > 0 && (
            <>
              <span className="ds-kickq" style={{ marginBottom: 14 }}>
                Start here
              </span>
              <div className="ds-stack" style={{ gap: 14 }}>
                {startHere.map((item, index) => (
                  <div key={item.slug} style={{ display: "flex", gap: 10 }}>
                    <span className="ds-num" style={{ fontSize: 13 }}>
                      {index + 1}
                    </span>
                    <Link
                      href={item.href}
                      className="ds-ser ds-plain-link"
                      style={{ fontSize: 18, lineHeight: 1.2 }}
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <>
          <div className="ds-divider" />
          <section style={{ padding: "32px var(--gut) 42px" }}>
            <h2 className="ds-t-l" style={{ marginBottom: 20 }}>
              Related reading
            </h2>
            <div className="ds-three">
              {related.map((item) => (
                <article key={item.slug}>
                  <span className="ds-kick" style={{ marginBottom: 8 }}>
                    {item.tag} · {item.minutes} min
                  </span>
                  <h3 className="ds-t-m" style={{ marginBottom: 8 }}>
                    <Link href={item.href} className="ds-plain-link">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="ds-dek" style={{ fontSize: 14 }}>
                    {item.summary}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="ds-railband" id="newsletter">
        <NewsletterBlock />
      </section>
    </main>
  );
}
