import type { Metadata } from "next";

import { AuthForm } from "@/components/site/AuthForm";
import { Masthead } from "@/components/site/Masthead";
import { generateMeta } from "@/lib/metadata";
import { baseURL } from "@/resources";

export const metadata: Metadata = generateMeta({
  title: "Create an account",
  description:
    "An account is only used to remember where you stopped reading, what you saved, and which lessons you finished.",
  baseURL,
  path: "/signup",
  noindex: true,
});

export default function SignupPage() {
  return (
    <main id="main">
      <Masthead current={null} />
      <section style={{ padding: "48px var(--gut) 90px" }}>
        <div className="ds-narrow">
          <h1 className="ds-t-page" style={{ marginBottom: 14 }}>
            Create an account
          </h1>
          <p className="ds-dek" style={{ maxWidth: "46ch", marginBottom: 28 }}>
            An account is only used to remember where you stopped reading, what you saved, and which
            lessons you finished.
          </p>
          <AuthForm mode="signup" />
        </div>
      </section>
    </main>
  );
}
