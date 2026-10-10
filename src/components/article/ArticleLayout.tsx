import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminEdit } from "@/components/site/AdminEdit";
import { Icon } from "@/components/site/icons";
import type { ReaderTarget } from "@/components/site/ScrollProgress";
import type { Heading } from "@/lib/headings";
import { formatShortDate } from "@/lib/site-data";
import { baseURL, editorial, learn, person } from "@/resources";
import { LessonEnd, ShareRow } from "./ArticleEnd";
import { ArticleReader, type LessonOutline } from "./ArticleReader";
import { LessonBar } from "./LessonBar";
import s from "./article.module.scss";

export type Related = { href: string; title: string; meta: string };

type Nav = { href: string; title: string } | null;

export type LessonProps = LessonOutline & {
  index: number;
  total: number;
  prev: Nav;
  next: Nav;
  partTitle: string;
};

type Props = {
  piece: ReaderTarget;
  summary: string;
  publishedAt?: string;
  /** Already passed through `resolveImage`. */
  image?: string | null;
  toc: Heading[];
  back: { href: string; label: string };
  /** `/admin/...` target for the admin-only Edit chip. */
  editHref?: string;
  related?: Related[];
  /** Rendered in the right aside under the contents. */
  aside?: ReactNode;
  lesson?: LessonProps;
  children: ReactNode;
};

/** The shared reading template: dark header card, symmetric reading grid, and the closing blocks. */
export function ArticleLayout({
  piece,
  summary,
  publishedAt,
  image,
  toc,
  back,
  editHref,
  related,
  aside,
  lesson,
  children,
}: Props) {
  const url = `${baseURL}${piece.href}`;
  const metaLine = [publishedAt && formatShortDate(publishedAt), `${piece.minutes} min read`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={s.page}>
      <div className="wrap">
        {lesson && <LessonCrumb lesson={lesson} />}

        <header className={s.header}>
          <div className={s.headerGlow} aria-hidden="true" />
          <div className={s.headerBody}>
            <div className={s.chips}>
              <Link href={back.href} className={s.back}>
                <Icon name="chevronLeft" size={14} />
                {back.label}
              </Link>
              {piece.tag && <span className={s.tag}>{piece.tag}</span>}
              {editHref && <AdminEdit href={editHref} />}
            </div>
            <h1 className={s.h1}>{piece.title}</h1>
            {summary && <p className={s.summary}>{summary}</p>}
            <div className={s.byline}>
              <Image
                className={s.avatar}
                src={person.avatar}
                alt=""
                width={34}
                height={34}
                sizes="34px"
              />
              <div className={s.bylineText}>
                <b>{person.name}</b>
                <span>{metaLine}</span>
              </div>
            </div>
          </div>
          {image && !lesson && (
            <div className={s.figure}>
              <Image
                src={image}
                alt=""
                width={720}
                height={390}
                priority
                sizes="(max-width: 760px) 100vw, 560px"
              />
            </div>
          )}
        </header>

        <ArticleReader toc={toc} piece={piece} lesson={lesson} extra={aside}>
          {children}
          {lesson ? (
            <LessonEnd
              course={lesson.course.slug}
              slug={lesson.slug}
              href={piece.href}
              prev={lesson.prev}
              next={lesson.next}
            />
          ) : (
            <>
              <ShareRow title={piece.title} url={url} />
              <div className={s.author}>
                <Image src={person.avatar} alt="" width={56} height={56} sizes="56px" />
                <div className={s.authorText}>
                  <b>Written by {person.name}</b>
                  <span>
                    {editorial.authorBlurb} Spotted a mistake?{" "}
                    <a href={`mailto:${person.email}`}>Tell me</a> — corrections get credited.
                  </span>
                </div>
                <Link href="/about" className="btnPrimary btnSm">
                  About me <Icon name="arrowRight" size={13} />
                </Link>
              </div>
            </>
          )}
        </ArticleReader>

        {related && related.length > 0 && (
          <section className={s.related} aria-label="Keep reading">
            <div className={s.relatedHead}>
              <b>Keep reading</b>
              <Link href={back.href}>{back.label} →</Link>
            </div>
            <div className={s.relatedGrid}>
              {related.map((r) => (
                <Link key={r.href} href={r.href} className={`card ${s.relatedCard}`}>
                  <small>{r.meta}</small>
                  <b>{r.title}</b>
                  <span>Read →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function LessonCrumb({ lesson }: { lesson: LessonProps }) {
  return (
    <div className={s.crumb}>
      <div className={s.crumbPath}>
        <Link href={learn.path}>{learn.label}</Link>
        <i>/</i>
        <Link href={`/learn/${lesson.course.slug}`} style={{ color: "var(--ink)" }}>
          {lesson.course.title}
        </Link>
        <i>/</i>
        <span>
          Part {lesson.partIndex + 1} · {lesson.partTitle}
        </span>
      </div>
      <div className={s.crumbRight}>
        <span>
          Lesson {lesson.index + 1} of {lesson.total}
        </span>
        <LessonBar
          course={lesson.course.slug}
          slugs={lesson.parts.flatMap((p) => p.lessons.map((l) => l.slug))}
        />
      </div>
    </div>
  );
}
