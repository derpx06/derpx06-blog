import {
  DataStyleConfig,
  DisplayConfig,
  FontsConfig,
  ProtectedRoutesConfig,
  RoutesConfig,
  SameAsConfig,
  SchemaConfig,
  SocialSharingConfig,
} from "@/types";
import { home, person } from "./content";
import { Archivo, DM_Serif_Display, JetBrains_Mono, VT323 } from "next/font/google";

// Used for SEO in meta tags, schema, sitemap and canonical URLs.
const baseURL: string = "https://derpx06.dev";

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/blog": true,
  "/explainers": true,
  "/learn": true,
};

const display: DisplayConfig = {
  location: false,
  time: false,
  themeSwitcher: true,
  chatbot: false,
  search: false,
};

// Password protection on selected routes (PAGE_ACCESS_PASSWORD in .env)
const protectedRoutes: ProtectedRoutesConfig = {};

const heading = Archivo({ variable: "--font-heading", subsets: ["latin"], display: "swap" });
const body = Archivo({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const label = Archivo({ variable: "--font-label", subsets: ["latin"], display: "swap" });
const code = JetBrains_Mono({ variable: "--font-code", subsets: ["latin"], display: "swap", weight: ["400", "500"] });

const fonts: FontsConfig = { heading, body, label, code };

// Display faces for the Explainers / Notes headlines only.
const serif = DM_Serif_Display({ variable: "--font-serif", subsets: ["latin"], display: "swap", weight: "400" });
const pixel = VT323({ variable: "--font-pixel", subsets: ["latin"], display: "swap", weight: "400" });
const displayFonts = { serif, pixel };

// Once UI tokens: only MDX internals (code blocks, media, tables) still read these.
const style = {
  theme: "system",
  brand: "violet",
  accent: "violet",
  neutral: "sand",
  border: "rounded",
  solid: "contrast",
  solidStyle: "flat",
  surface: "filled",
  transition: "micro",
  scaling: "100",
};

const dataStyle: DataStyleConfig = {
  variant: "flat",
  mode: "categorical",
  height: 24,
  axis: { stroke: "var(--neutral-alpha-weak)" },
  tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
};

const schema: SchemaConfig = {
  logo: "",
  type: "Person",
  name: `${person.firstName} ${person.lastName}`,
  description: home.description,
  email: person.email,
};

const sameAs: SameAsConfig = {
  github: "https://github.com/derpx06",
  linkedin: "https://www.linkedin.com/in/manas-khairnar-98329132b/",
};

const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: { x: true, linkedin: true, facebook: false, pinterest: false, whatsapp: false, reddit: false, telegram: false, email: true, copyLink: true },
};

export { display, routes, protectedRoutes, baseURL, fonts, displayFonts, style, schema, sameAs, socialSharing, dataStyle };
