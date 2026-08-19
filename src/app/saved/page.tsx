import type { Metadata } from "next";

import { Masthead } from "@/components/site/Masthead";
import { SavedList } from "@/components/site/SavedList";
import { SignOutButton } from "@/components/site/SignOutButton";
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
      <Masthead current={null} />
      <section style={{ padding: "38px var(--gut) 70px" }}>
        <div className="ds-between" style={{ marginBottom: 20 }}>
          <h1 className="ds-t-page">Reading queue</h1>
          <SignOutButton />
        </div>
        <SavedList />
      </section>
    </main>
  );
}
