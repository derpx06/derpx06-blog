import Link from "next/link";
import { ArticleLayout } from "@/components/article/ArticleLayout";
import type { Heading } from "@/lib/headings";
import { resolveImage } from "@/lib/images";
import type { Piece } from "@/lib/site-data";
import { blog, explainers, learn, work } from "@/resources";
import type { ContentBodyFormat } from "@/types/content.types";
import { ArticleBody } from "./ArticleBody";
import s from "@/components/article/article.module.scss";

export type ArticleViewProps = {
  piece: Piece;
  body: string;
  /** "html" when the piece was written in the editor; defaults to "mdx". */
  bodyFormat?: ContentBodyFormat;
  headings: Heading[];
  /** Same-tag-first suggestions for the closing band. */
  related: Piece[];
  /** The piece to read next, shown in the in-article continuation block. */
  next: Piece | null;
  /** Section root, e.g. "/blog" — the back link and the "Keep reading" footer link. */
  sectionHref: string;
  startHere: Piece[];
};

const SECTIONS = [blog, explainers, work, learn];

export function ArticleView({
  piece,
  body,
  bodyFormat,
  headings,
  related,
  next,
  sectionHref,
  startHere,
}: ArticleViewProps) {
  const section = SECTIONS.find((item) => item.path === sectionHref) ?? blog;
  const seen = new Set<string>([piece.slug]);
  const keepReading = [next, ...related]
    .filter((item): item is Piece => !!item && !seen.has(item.slug) && !!seen.add(item.slug))
    .map((item) => ({
      href: item.href,
      title: item.title,
      meta: `${item.tag} · ${item.minutes} min`,
    }));

  return (
    <ArticleLayout
      piece={{
        slug: piece.slug,
        href: piece.href,
        title: piece.title,
        minutes: piece.minutes,
        tag: piece.tag,
      }}
      summary={piece.summary}
      publishedAt={piece.publishedAt}
      image={resolveImage(piece.image)}
      toc={headings}
      back={{ href: sectionHref, label: section.label }}
      editHref={`/admin/content/${sectionHref.replace(/^\//, "")}/${piece.slug}`}
      related={keepReading}
      aside={
        startHere.length > 0 && (
          <div>
            <div className={s.asideH}>Start here</div>
            <div className={s.start}>
              {startHere.map((item, index) => (
                <Link key={item.slug} href={item.href}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )
      }
    >
      <ArticleBody body={body} bodyFormat={bodyFormat} />
    </ArticleLayout>
  );
}
