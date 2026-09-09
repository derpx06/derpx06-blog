import { adminEmails, isAdminEmail } from "./admin-emails";
import { getCurrentUser } from "./session";
import type { PublicUser } from "./users";

export { adminEmails, isAdminEmail };

/**
 * Authorisation for the admin CMS. One module, so there is exactly one answer
 * to "is this request allowed to change published content".
 *
 * Admins are an env allowlist over ordinary reader accounts — there is no role
 * field in Mongo, so who is an admin cannot be changed by writing to the
 * database, only by changing the deploy's configuration.
 *
 * That only holds because signup refuses to create an account for an
 * allowlisted address (see src/app/api/auth/signup/route.ts). Signup is
 * otherwise open, so without that rule the first person to register an
 * allowlisted email would become an admin. Admin accounts are created with
 * `npm run admin:create`.
 */

/**
 * The signed-in admin, or null. Re-checks the allowlist on every call rather
 * than trusting anything stamped into the session, so removing an address from
 * `ADMIN_EMAILS` takes effect on the next request instead of the next login.
 */
export async function requireAdmin(): Promise<PublicUser | null> {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

export type AdminGuardResult =
  | { ok: true; user: PublicUser }
  | { ok: false; status: 401 | 403; error: string };

/**
 * The guard every /api/admin/* route calls first.
 *
 * `src/proxy.ts` deliberately excludes /api from its matcher — each route
 * guards itself — so nothing else is standing in front of these.
 */
export async function adminGuard(): Promise<AdminGuardResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, error: "Sign in required." };
  if (!isAdminEmail(user.email)) return { ok: false, status: 403, error: "Not allowed." };
  return { ok: true, user };
}
