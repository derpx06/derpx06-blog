import Image from "next/image";
import { gallery } from "@/resources";

/** Masonry via CSS columns — no layout library, no client JS. */
export default function GalleryView() {
  if (gallery.images.length === 0) {
    return <p className="ds-dek">No photographs yet.</p>;
  }

  return (
    <div className="ds-masonry">
      {gallery.images.map((image) => (
        <figure key={image.src} className="ds-masonry-item">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.orientation === "horizontal" ? 1200 : 800}
            height={image.orientation === "horizontal" ? 800 : 1200}
            sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 33vw"
            style={{ width: "100%", height: "auto" }}
          />
        </figure>
      ))}
    </div>
  );
}
