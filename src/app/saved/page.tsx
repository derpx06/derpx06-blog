import { Meta } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL } from "@/resources";
import { SavedClient } from "@/components/saved/SavedClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...Meta.generate({ title: "Saved", description: "Your reading queue.", baseURL, image: `/api/og/generate?title=${encodeURIComponent("Saved")}`, path: "/saved" }),
    robots: { index: false },
  };
}

export default function Saved() {
  return <SavedClient />;
}
