export type JsonLdProps = {
  as: "website" | "article" | "blogPosting" | "techArticle" | "webPage" | "organization";
  title: string;
  description: string;
  baseURL: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  sameAs?: string[];
  author?: { name: string; url?: string; image?: string };
};

const TYPES: Record<JsonLdProps["as"], string> = {
  website: "WebSite",
  article: "Article",
  blogPosting: "BlogPosting",
  techArticle: "TechArticle",
  webPage: "WebPage",
  organization: "Organization",
};

function absolute(baseURL: string, value?: string) {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value)) return value;
  return `${baseURL.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

/** Replaces Once UI's `<Schema>`: same props, emits plain JSON-LD. */
export function JsonLd({
  as,
  title,
  description,
  baseURL,
  path,
  datePublished,
  dateModified,
  image,
  sameAs,
  author,
}: JsonLdProps) {
  const url = absolute(baseURL, path);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": TYPES[as],
    name: title,
    headline: title,
    description,
    url,
    image: absolute(baseURL, image),
    datePublished,
    dateModified: dateModified || datePublished,
    sameAs,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          url: author.url,
          image: absolute(baseURL, author.image),
        }
      : undefined,
  };

  // JSON.stringify already drops undefined values.
  return (
    <script
      type="application/ld+json"
      // Escaping `<` keeps a stray "</script>" inside a title from closing the tag.
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be injected as raw text
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default JsonLd;
