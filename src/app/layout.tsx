import "@once-ui-system/core/css/styles.css";
import "@once-ui-system/core/css/tokens.css";
import "@/resources/custom.css";
import 'katex/dist/katex.min.css';

import classNames from "classnames";

import {
  Background,
  Column,
  Flex,
  Meta,
  opacity,
  RevealFx,
  SpacingToken,
} from "@once-ui-system/core";
import { Footer, Header, RouteGuard, Providers } from "@/components";
import { ChatWidget } from "@/components/ChatWidget";
import { Analytics } from "@vercel/analytics/next";
import { baseURL, effects, fonts, style, dataStyle, home, display } from "@/resources";
import React from "react";

// @ts-ignore
export async function generateMetadata() {
  const meta = await Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });

  return {
    ...meta,
    openGraph: {
      title: home.title,
      description: home.description,
      url: baseURL,
      siteName: home.title,
      images: [
        {
          url: home.image,
          width: 1200,
          height: 630,
          alt: home.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: home.title,
      description: home.description,
      images: [home.image],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Flex
      suppressHydrationWarning
      as="html"
      lang="en"
      fillWidth
      className={classNames(
        fonts.heading.variable,
        fonts.body.variable,
        fonts.label.variable,
        fonts.code.variable,
      )}
    >

      <Providers>
        <Column
          as="body"
          suppressHydrationWarning={true}
          background="page"
          fillWidth
          style={{ minHeight: "100vh" }}
          margin="0"
          padding="0"
          horizontal="center"
        >
          <script
            id="theme-init"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const root = document.documentElement;
                    const defaultTheme = 'system';
                    
                    // Set defaults from config
                    const config = ${JSON.stringify({
                brand: style.brand,
                accent: style.accent,
                neutral: style.neutral,
                solid: style.solid,
                "solid-style": style.solidStyle,
                border: style.border,
                surface: style.surface,
                transition: style.transition,
                scaling: style.scaling,
                "viz-style": dataStyle.variant,
              })};
                    
                    // Apply default values
                    Object.entries(config).forEach(([key, value]) => {
                      root.setAttribute('data-' + key, value);
                    });
                    
                    // Resolve theme
                    const resolveTheme = (themeValue) => {
                      if (!themeValue || themeValue === 'system') {
                        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      }
                      return themeValue;
                    };
                    
                    // Apply saved theme
                    const savedTheme = localStorage.getItem('data-theme');
                    const resolvedTheme = resolveTheme(savedTheme);
                    root.setAttribute('data-theme', resolvedTheme);
                    
                    // Apply any saved style overrides
                    const styleKeys = Object.keys(config);
                    styleKeys.forEach(key => {
                      const value = localStorage.getItem('data-' + key);
                      if (value) {
                        root.setAttribute('data-' + key, value);
                      }
                    });
                  } catch (e) {
                    console.error('Failed to initialize theme:', e);
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                })();
              `,
            }}
          />
          <RevealFx fill position="absolute">
            <Background
              mask={{
                x: effects.mask.x,
                y: effects.mask.y,
                radius: effects.mask.radius,
                cursor: effects.mask.cursor,
              }}
              gradient={{
                display: effects.gradient.display,
                opacity: effects.gradient.opacity as opacity,
                x: effects.gradient.x,
                y: effects.gradient.y,
                width: effects.gradient.width,
                height: effects.gradient.height,
                tilt: effects.gradient.tilt,
                colorStart: effects.gradient.colorStart,
                colorEnd: effects.gradient.colorEnd,
              }}
              dots={{
                display: effects.dots.display,
                opacity: effects.dots.opacity as opacity,
                size: effects.dots.size as SpacingToken,
                color: effects.dots.color,
              }}
              grid={{
                display: effects.grid.display,
                opacity: effects.grid.opacity as opacity,
                color: effects.grid.color,
                width: effects.grid.width,
                height: effects.grid.height,
              }}
              lines={{
                display: effects.lines.display,
                opacity: effects.lines.opacity as opacity,
                size: effects.lines.size as SpacingToken,
                thickness: effects.lines.thickness,
                angle: effects.lines.angle,
                color: effects.lines.color,
              }}
            />
          </RevealFx>
          <Flex fillWidth minHeight="16" s={{ hide: true }} />
          <Header />
          <Flex zIndex={0} fillWidth padding="l" horizontal="center" flex={1}>
            <Flex horizontal="center" fillWidth minHeight="0">
              <RouteGuard>{children}</RouteGuard>
            </Flex>
          </Flex>
          <Footer />
          {display.chatbot && (
            <Flex s={{ hide: true }}>
              <ChatWidget />
            </Flex>
          )}
          <Analytics />
        </Column>
      </Providers>
    </Flex>
  );
}
