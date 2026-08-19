import type { Metadata } from "next";

import { AuthForm } from "@/components/site/AuthForm";
import { Masthead } from "@/components/site/Masthead";
import { generateMeta } from "@/lib/metadata";
import { baseURL } from "@/resources";

export const metadata: Metadata = generateMeta({
  title: "Sign in",
  description:
    "Sign in to keep your place, save pieces for later, and track course progress across devices.",
  baseURL,
  path: "/signin",
  noindex: true,
});

export default function SigninPage() {
  return (
    <main id="main">
      <Masthead current={null} />
      <section style={{ padding: "48px var(--gut) 90px" }}>
        <div className="ds-narrow">
          <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
            Sign in
          </h1>
          <p className="ds-dek" style={{ maxWidth: "46ch", marginBottom: 28 }}>
            Sign in to keep your place, save pieces for later, and track course progress across
            devices.
          </p>
          <AuthForm mode="signin" />
        </div>
      </section>
    </main>
  );
}
