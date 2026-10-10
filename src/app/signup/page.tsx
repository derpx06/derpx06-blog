import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/site/AuthForm";
import s from "@/components/site/auth.module.scss";
import { Icon } from "@/components/site/icons";
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
    <main id="main" className={`wrap ${s.page}`}>
      <div className={`darkCard ${s.card}`}>
        <span className="glow" aria-hidden="true" />
        <div className={s.inner}>
          <span className="eyebrow">Account</span>
          <h1 className={s.h1}>Create an account.</h1>
          <p className={s.p}>
            An account is only used to remember where you stopped reading, what you saved, and which
            lessons you finished.
          </p>
          <AuthForm mode="signup" />
          <Link href="/" className={s.back}>
            <Icon name="chevronLeft" size={14} /> Back
          </Link>
        </div>
      </div>
    </main>
  );
}
