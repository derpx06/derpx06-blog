import { redirect } from "next/navigation";

// Drafts live in the admin dashboard now.
export default function DraftsPage() {
  redirect("/admin?status=draft");
}
