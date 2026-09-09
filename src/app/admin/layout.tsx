import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/admin";

/**
 * Every admin page is gated here.
 *
 * `src/proxy.ts` enforces the public route policy, but `/admin` is not in
 * `routes` — and that config is a deny-list, so an unlisted path is a live
 * page. The guard therefore has to be this layout, and it runs server-side
 * before any child renders, so nothing about the CMS reaches an anonymous
 * visitor.
 */

// Reads the session cookie, so this subtree is dynamic by definition. It is
// deliberately the only part of the site that is.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  if (!user) redirect("/signin?next=/admin");

  return (
    <div className="ds-admin">
      <header className="ds-admin-bar">
        <Link href="/admin" className="ds-admin-brand">
          Admin
        </Link>
        <AdminNav />
        <div className="ds-admin-who">
          <Link href="/" className="ds-meta ds-meta-s">
            View site ↗
          </Link>
          <span className="ds-meta ds-meta-s">{user.email}</span>
        </div>
      </header>
      <main id="main" className="ds-admin-main">
        {children}
      </main>
    </div>
  );
}
