import "@/styles/vendor.css";
import "@/resources/custom.css";
import "@/styles/theme.css";

import classNames from "classnames";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Meta } from "@once-ui-system/core";
import { RouteGuard, Providers } from "@/components";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { baseURL, fonts, displayFonts, style, dataStyle, home } from "@/resources";
import React from "react";

export async function generateMetadata() {
  const meta = await Meta.generate({
    title: home.title,
    description: home.description,
    baseURL,
    path: home.path,
    image: home.image,
  });
  return {
    ...meta,
    openGraph: {
      title: home.title,
      description: home.description,
      url: baseURL,
      siteName: "derpx06.dev",
      images: [{ url: home.image, width: 1200, height: 630, alt: home.title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: home.title, description: home.description, images: [home.image] },
  };
}

const themeInit = `(function(){try{var r=document.documentElement;var c=${JSON.stringify({
  brand: style.brand, accent: style.accent, neutral: style.neutral, solid: style.solid, "solid-style": style.solidStyle,
  border: style.border, surface: style.surface, transition: style.transition, scaling: style.scaling, "viz-style": dataStyle.variant,
})};Object.keys(c).forEach(function(k){r.setAttribute('data-'+k,c[k])});var t=localStorage.getItem('data-theme');if(!t||t==='system'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}r.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={classNames(fonts.heading.variable, fonts.body.variable, fonts.label.variable, fonts.code.variable, displayFonts.serif.variable, displayFonts.pixel.variable)}
    >
      <body suppressHydrationWarning>
        <script id="theme-init" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Providers>
          <a href="#main" className="skipLink">Skip to content</a>
          <SiteNav />
          <main id="main" className="main">
            <RouteGuard>{children}</RouteGuard>
          </main>
          <SiteFooter />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
