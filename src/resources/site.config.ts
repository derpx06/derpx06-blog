import { Figtree, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import type {
  DisplayConfig,
  EditorialConfig,
  FontsConfig,
  MailchimpConfig,
  SameAsConfig,
  SchemaConfig,
  SocialSharingConfig,
} from "@/types";
import { home, person } from "./content";
// Route policy lives in its own module so the proxy can read it without
// pulling in next/font. Re-exported below so `@/resources` is unchanged.
import { protectedRoutes, routes } from "./route-policy";

/**
 * Canonical origin for meta tags, JSON-LD, sitemap and RSS. Set SITE_URL in
 * the deploy environment; the Vercel-provided host is the fallback so preview
 * builds still emit correct absolute URLs.
 */
const baseURL: string =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://derpx06.online");

const display: DisplayConfig = {
  location: false,
  time: false,
  themeSwitcher: true,
  chatbot: false,
  search: true,
};

/* --------------------------------------------------------------- typography */

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Figtree({
  variable: "--font-sans-ds",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-ds",
  subsets: ["latin"],
  display: "swap",
});

const fonts: FontsConfig = { serif, sans, mono };

/* ---------------------------------------------------------------- editorial */

const editorial: EditorialConfig = {
  tagline: "Notes on systems, models & learning",
  footerBlurb: "Notes in public — systems, models, and the long way round to understanding them.",
  footerColumns: [
    {
      title: "Read",
      links: [
        { label: "Writing", href: "/blog" },
        { label: "Explainers", href: "/explainers" },
        { label: "Saved", href: "/saved" },
        { label: "RSS", href: "/api/rss" },
      ],
    },
    {
      title: "Learn",
      links: [
        { label: "Courses", href: "/learn" },
        { label: "About", href: "/about" },
      ],
    },
    {
      title: "Elsewhere",
      links: [
        { label: "GitHub", href: "https://github.com/derpx06", external: true },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/manas-khairnar-98329132b/",
          external: true,
        },
        { label: "Email", href: `mailto:${person.email}`, external: true },
      ],
    },
  ],
  authorBlurb:
    "A developer working on retrieval systems and the plumbing around models — teaching what I got wrong first.",
  wordsPerMinute: 220,
};

/* ------------------------------------------------------------------- misc */

/**
 * Newsletter form target. Until this is a real Mailchimp (or other provider)
 * action URL, `NewsletterBlock` renders nothing rather than posting subscribers
 * into the void — the placeholder below is not a reachable host.
 */
const mailchimp: MailchimpConfig = {
  action: "",
};

const schema: SchemaConfig = {
  logo: "",
  type: "Person",
  name: person.name,
  description: home.description,
  email: person.email,
};

const sameAs: SameAsConfig = {
  github: "https://github.com/derpx06",
  linkedin: "https://www.linkedin.com/in/manas-khairnar-98329132b/",
};

const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: {
    x: true,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: false,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

export {
  baseURL,
  display,
  editorial,
  fonts,
  mailchimp,
  protectedRoutes,
  routes,
  sameAs,
  schema,
  socialSharing,
};
