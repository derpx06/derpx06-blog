import Link from "next/link";
import type { ReactNode } from "react";
import { Schema } from "@once-ui-system/core";
import { baseURL, about, person } from "@/resources";
import { formatShortDate, type TocItem } from "@/lib/article";
import type { SavedKind } from "@/lib/user-store";
import { showableImage, type Source } from "@/utils/utils";
import { ScrollToHash } from "@/components/ScrollToHash";
import { Icon } from "@/components/site/icons";
import { ArticleReader, type LessonOutline } from "./ArticleReader";
import { LessonEnd, ShareRow } from "./ArticleEnd";
import s from "./article.module.scss";

export type Related = { href: string; title: string; meta: string };

type Props = {
  kind: SavedKind;
  path: string; // site path, e.g. /blog/foo
  title: string;
  summary: string;
  publishedAt?: string;
  tag?: string;
  image?: string;
  minutes: number;
  toc: TocItem[];
  back: { href: string; label: string };
  related?: Related[];
  sources?: Source[];
  lesson?: LessonOutline & { index: number; total: number; prev: { href: string; title: string } | null; next: { href: string; title: string } | null; partTitle: string };
  children: ReactNode;
};

const KIND_LABEL: Record<SavedKind, string> = { article: "Essay", explainer: "Explainer", lesson: "Note" };

export function ArticleLayout({ kind, path: sitePath, title, summary, publishedAt, tag, image, minutes, toc, back, related, sources = [], lesson, children }: Props) {
  const url = `${baseURL}${sitePath}`;
  const hasImage = !!showableImage(image);
  if (sources.length) toc = [...toc, { id: "sources", text: "Sources", level: 2 }];
  const metaLine = [publishedAt && formatShortDate(publishedAt), `${minutes} min read`].filter(Boolean).join(" · ");

  return (
    <div className={s.page}>
      <div className="wrap">
        <Schema
          as="blogPosting"
          baseURL={baseURL}
          path={sitePath}
          title={title}
          description={summary}
          datePublished={publishedAt || new Date().toISOString().slice(0, 10)}
          dateModified={publishedAt || new Date().toISOString().slice(0, 10)}
          image={image || `/api/og/generate?title=${encodeURIComponent(title)}`}
          author={{ name: `${person.firstName} ${person.lastName}`, url: `${baseURL}${about.path}`, image: `${baseURL}${person.avatar}` }}
        />

        {lesson && <LessonCrumb lesson={lesson} />}

        <header className={s.header}>
          <div className={s.headerGlow} aria-hidden="true" />
          <div className={s.headerBody}>
            <div className={s.chips}>
              <Link href={back.href} className={s.back}><Icon name="chevronLeft" size={14} />{back.label}</Link>
              {tag && <span className={s.tag}>{tag}</span>}
            </div>
            <h1 className={s.h1}>{title}</h1>
            {summary && <p className={s.summary}>{summary}</p>}
            <div className={s.byline}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.avatar} src={person.avatar} alt="" width={34} height={34} />
              <div className={s.bylineText}><b>{person.name}</b><span>{metaLine}</span></div>
            </div>
          </div>
          {hasImage && !lesson && (
            <div className={s.figure}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" loading="eager" />
            </div>
          )}
        </header>

        <ArticleReader
          toc={toc}
          minutes={minutes}
          save={{ kind, slug: sitePath.split("/").slice(-1)[0], title, href: sitePath, meta: `${KIND_LABEL[kind]} · ${minutes} min` }}
          lesson={lesson}
        >
          {children}
          {sources.length > 0 && <Sources sources={sources} />}
          {lesson ? (
            <LessonEnd course={lesson.course.slug} slug={lesson.slug} prev={lesson.prev} next={lesson.next} />
          ) : (
            <>
              <ShareRow title={title} url={url} />
              <div className={s.author}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={person.avatar} alt="" width={56} height={56} />
                <div className={s.authorText}>
                  <b>Written by {person.name}</b>
                  <span>{person.role}. Spotted a mistake? <a href={`mailto:${person.email}`}>Tell me</a> — corrections get credited.</span>
                </div>
                <Link href="/about" className="btnPrimary btnSm">About me <Icon name="arrowRight" size={13} /></Link>
              </div>
            </>
          )}
        </ArticleReader>

        {related && related.length > 0 && (
          <section className={s.related} aria-label="Keep reading">
            <div className={s.relatedHead}><b>Keep reading</b><Link href={back.href}>{back.label} →</Link></div>
            <div className={s.relatedGrid}>
              {related.map((r) => (
                <Link key={r.href} href={r.href} className={`card ${s.relatedCard}`}><small>{r.meta}</small><b>{r.title}</b><span>Read →</span></Link>
              ))}
            </div>
          </section>
        )}
        <ScrollToHash />
      </div>
    </div>
  );
}

function Sources({ sources }: { sources: Source[] }) {
  const host = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
  return (
    <section id="sources" className={s.sources} aria-label="Sources">
      <h2>Sources</h2>
      <ol>
        {sources.map((src) => (
          <li key={src.url}>
            <a href={src.url} target="_blank" rel="noopener noreferrer">{src.title}</a>
            {(src.authors || src.year) && <span className={s.srcBy}>{[src.authors, src.year].filter(Boolean).join(" · ")}</span>}
            <span className={s.srcHost}>{host(src.url)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LessonCrumb({ lesson }: { lesson: NonNullable<Props["lesson"]> }) {
  return (
    <div className={s.crumb}>
      <div className={s.crumbPath}>
        <Link href="/learn">Notes</Link><i>/</i>
        <Link href={`/learn/${lesson.course.slug}`} style={{ color: "var(--ink)" }}>{lesson.course.title}</Link><i>/</i>
        <span>Part {lesson.partIndex + 1} · {lesson.partTitle}</span>
      </div>
      <div className={s.crumbRight}>
        <span>Lesson {lesson.index + 1} of {lesson.total}</span>
        <LessonBar course={lesson.course.slug} total={lesson.total} />
      </div>
    </div>
  );
}

import { LessonBar } from "./LessonBar";
