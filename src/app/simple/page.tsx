import { redirect } from "next/navigation";

// Legacy template route; the real writing surface is the admin editor.
export default function SimplePage() {
  redirect("/blog/editor");
}
