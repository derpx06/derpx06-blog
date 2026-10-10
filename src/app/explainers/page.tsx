import type { Metadata } from "next";
import { ExplainerList } from "@/components/listing/ExplainerList";
import type { ListItem } from "@/components/listing/WritingList";
import { JsonLd } from "@/components/site/JsonLd";
import { resolveImage } from "@/lib/images";
import { generateMeta } from "@/lib/metadata";
import { getPieces } from "@/lib/site-data";
import { baseURL, explainers, person } from "@/resources";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: explainers.title,
    description: explainers.description,
    baseURL,
    path: explainers.path,
  });
}

export default async function Explainers() {
  const items: ListItem[] = (await getPieces("explainers")).map((piece) => ({
    ...piece,
    image: resolveImage(piece.image),
  }));

  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={explainers.path}
        title={explainers.title}
        description={explainers.description}
        author={{ name: person.name, url: `${baseURL}/explainers`, image: person.avatar }}
      />
      <ExplainerList items={items} adminHref="/admin/content?section=explainers" />
    </main>
  );
}
