import type { Metadata } from "next";
import { resolveImage } from "./images";

export type MetaProps = {
  title: string;
  description: string;
  baseURL: string;
  path?: string;
  type?: "website" | "article";
  image?: string;
  publishedTime?: string;
  author?: { name: string; url?: string };
  canonical?: string;
  robots?: string;
  noindex?: boolean;
  nofollow?: boolean;
  alternates?: Array<{ href: string; hrefLang: string }>;
};

function absolute(baseURL: string, value: string) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${baseURL.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

/**
 * Drop-in replacement for Once UI's `Meta.generate` — same options, plain Next
 * `Metadata` out, no component library behind it.
 */
export function generateMeta({
  title,
  description,
  baseURL,
  path = "/",
  type = "website",
  image,
  publishedTime,
  author,
  canonical,
  noindex,
  nofollow,
  alternates,
}: MetaProps): Metadata {
  const url = canonical || absolute(baseURL, path);
  // A path that is not on disk would be emitted as an absolute URL and 404 for
  // every crawler that follows it. Fall through to the generated card instead.
  const ogImage = absolute(
    baseURL,
    resolveImage(image) || `/api/og/generate?title=${encodeURIComponent(title)}`,
  );

  return {
    metadataBase: new URL(baseURL),
    title,
    description,
    alternates: {
      canonical: url,
      languages: alternates?.length
        ? Object.fromEntries(alternates.map((item) => [item.hrefLang, item.href]))
        : undefined,
    },
    robots: { index: !noindex, follow: !nofollow },
    authors: author ? [{ name: author.name, url: author.url }] : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: title,
      type,
      publishedTime,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Kept so existing `Meta.generate(...)` call sites need no rewrite. */
export const Meta = { generate: generateMeta };
