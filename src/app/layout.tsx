import "@/resources/custom.css";
import "@/resources/design-system.css";
import "katex/dist/katex.min.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import classNames from "classnames";
import type { Metadata } from "next";

import { Providers, RouteGuard } from "@/components";
import { SiteFooter } from "@/components/site/SiteFooter";
import { THEME_INIT_SCRIPT } from "@/components/site/theme";
import { generateMeta } from "@/lib/metadata";
import { baseURL, fonts, home } from "@/resources";

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    title: home.title,
    description: home.description,
    baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={classNames(fonts.serif.variable, fonts.sans.variable, fonts.mono.variable)}
    >
      <head>
        <script
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: the theme must be set before first paint
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <a className="ds-skip" href="#main">
            Skip to content
          </a>
          <div className="ds-app">
            <div className="ds-sheet">
              <RouteGuard>{children}</RouteGuard>
              <SiteFooter />
            </div>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
