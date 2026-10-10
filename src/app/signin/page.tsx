import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/site/AuthForm";
import s from "@/components/site/auth.module.scss";
import { Icon } from "@/components/site/icons";
import { generateMeta } from "@/lib/metadata";
import { baseURL } from "@/resources";

export const metadata: Metadata = generateMeta({
  title: "Sign in",
  description:
    "Sign in to keep your place, save pieces for later, and track course progress across devices.",
  baseURL,
  path: "/signin",
  noindex: true,
});

export default function SigninPage() {
  return (
    <main id="main" className={`wrap ${s.page}`}>
      <div className={`darkCard ${s.card}`}>
        <span className="glow" aria-hidden="true" />
        <div className={s.inner}>
          <span className="eyebrow">Account</span>
          <h1 className={s.h1}>Sign in to keep your place.</h1>
          <p className={s.p}>
            Your reading queue and course progress are stored on your account, so they follow you
            across devices. Nothing else is collected.
          </p>
          <AuthForm mode="signin" />
          <Link href="/" className={s.back}>
            <Icon name="chevronLeft" size={14} /> Back
          </Link>
        </div>
      </div>
    </main>
  );
}

