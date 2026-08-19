import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EditorClient from "@/components/editor/EditorClient";
import { isLocalArticleEditorHost } from "@/lib/article-editor-access";

export default async function EditorPage() {
  const requestHeaders = await headers();
  if (!isLocalArticleEditorHost(requestHeaders.get("host"))) notFound();

  return <EditorClient />;
}
