import type { NextFontWithVariable } from "next/dist/compiled/@next/font";

/**
 * Display configuration for UI elements.
 */
export type DisplayConfig = {
  location: boolean;
  time: boolean;
  themeSwitcher: boolean;
  chatbot: boolean;
  search: boolean;
};

/**
 * Route configuration for enabled/disabled routes.
 */
export type RoutesConfig = Record<`/${string}`, boolean>;

/**
 * Protected route configuration.
 */
export type ProtectedRoutesConfig = Record<`/${string}`, boolean>;

/**
 * Font configuration. `serif` sets headlines, `sans` sets everything else,
 * `mono` is code — matching the three faces the design system uses.
 */
export type FontsConfig = {
  serif: NextFontWithVariable;
  sans: NextFontWithVariable;
  mono: NextFontWithVariable;
  pixel: NextFontWithVariable;
};

/**
 * Newsletter form configuration.
 */
export type MailchimpConfig = {
  action: string;
};

/**
 * Schema data for SEO/meta tags.
 */
export type SchemaConfig = {
  logo: string;
  type: string;
  name: string;
  description: string;
  email: string;
};

/**
 * Social links for the organization schema.
 */
export type SameAsConfig = Record<string, string>;

/**
 * Social sharing configuration for blog posts.
 */
export type SocialSharingConfig = {
  display: boolean;
  platforms: {
    x: boolean;
    linkedin: boolean;
    facebook: boolean;
    pinterest: boolean;
    whatsapp: boolean;
    reddit: boolean;
    telegram: boolean;
    email: boolean;
    copyLink: boolean;
  };
};

/**
 * A footer column in the design's four-up footer.
 */
export type FooterColumn = {
  title: string;
  links: Array<{ label: string; href: string; external?: boolean }>;
};

/**
 * Editorial copy the design hardcodes, lifted out so it can be changed
 * without touching JSX.
 */
export type EditorialConfig = {
  tagline: string;
  footerBlurb: string;
  footerColumns: FooterColumn[];
  authorBlurb: string;
  wordsPerMinute: number;
};
