import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import EditorClient from "@/components/editor/EditorClient";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export const metadata: Metadata = { title: "Editor", robots: { index: false, follow: false } };

export default async function EditorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin?callbackUrl=/blog/editor");
  }
  if (!isAdminEmail(session.user?.email)) notFound();

  return <EditorClient />;
}
