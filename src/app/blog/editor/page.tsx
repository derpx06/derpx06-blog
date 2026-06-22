import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import EditorClient from "@/components/editor/EditorClient";
import { authOptions } from "@/lib/auth";

export default async function EditorPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <EditorClient />;
}
