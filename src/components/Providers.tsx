"use client";

import { ReaderProvider } from "@/components/site/ReaderProvider";
import { SearchPalette } from "@/components/site/SearchPalette";
import { ThemeProvider } from "@/components/site/theme";
import { ToastProvider } from "@/components/site/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ReaderProvider>
          {children}
          <SearchPalette />
        </ReaderProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
