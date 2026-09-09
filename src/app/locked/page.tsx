import type { Metadata } from "next";
import { Masthead } from "@/components/site/Masthead";
import { PageAccessForm } from "@/components/site/PageAccessForm";

export const metadata: Metadata = {
  title: "Password required",
  robots: { index: false, follow: false },
};

/**
 * Where `proxy.ts` rewrites a protected route when the access cookie is
 * missing. Nothing here reads the requested page, so the protected HTML is
 * never rendered — which was the whole problem with gating on the client.
 */
export default function LockedPage() {
  return (
    <>
      <Masthead current={null} />
      <PageAccessForm />
    </>
  );
}
