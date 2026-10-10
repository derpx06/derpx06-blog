import type { Metadata } from "next";

import { SavedClient } from "@/components/saved/SavedClient";
import { generateMeta } from "@/lib/metadata";
import { baseURL } from "@/resources";

export const metadata: Metadata = generateMeta({
  title: "Saved",
  description: "Your reading queue.",
  baseURL,
  path: "/saved",
  noindex: true,
});

export default function SavedPage() {
  return (
    <main id="main">
      <SavedClient />
    </main>
  );
}
