import type { Metadata } from "next";
import { SignInClient } from "./SignInClient";

export const metadata: Metadata = { title: "Sign in — derpx06.dev", robots: { index: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  const safe = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";
  return <SignInClient callbackUrl={safe} configured={!!process.env.GOOGLE_CLIENT_ID} />;
}
