import type { Metadata } from "next";

import GalleryView from "@/components/gallery/GalleryView";
import { JsonLd } from "@/components/site/JsonLd";
import { generateMeta } from "@/lib/metadata";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: gallery.title,
    description: gallery.description,
    baseURL,
    path: gallery.path,
  });
}

export default function Gallery() {
  return (
    <main id="main">
      <JsonLd
        as="webPage"
        baseURL={baseURL}
        path={gallery.path}
        title={gallery.title}
        description={gallery.description}
        author={{ name: person.name, url: `${baseURL}${gallery.path}`, image: person.avatar }}
      />
      <div style={{ padding: "38px var(--gut) 20px" }}>
        <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
          Gallery
        </h1>
        <p className="ds-dek" style={{ maxWidth: "52ch" }}>
          {gallery.description}
        </p>
      </div>
      <div style={{ padding: "0 var(--gut) 44px" }}>
        <GalleryView />
      </div>
    </main>
  );
}
