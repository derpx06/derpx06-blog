"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export type ThemePreference = Theme | "system";

const STORAGE_KEY = "data-theme";

/**
 * Runs before paint so the first frame is already the right colour. Kept in
 * sync with the reducer below — both read the same localStorage key and write
 * the same `data-theme` attribute.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var s=localStorage.getItem('${STORAGE_KEY}');
var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
document.documentElement.setAttribute('data-theme',t);
}catch(e){document.documentElement.setAttribute('data-theme','light')}})();`;

type ThemeContextValue = {
  theme: Theme;
  preference: ThemePreference;
  setTheme: (next: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server render matches the pre-paint script's default; the effect below
  // corrects it on mount, before anything reads `theme`.
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [theme, setResolved] = useState<Theme>("light");

  useEffect(() => {
    const initial = storedPreference();
    setPreference(initial);
    setResolved(initial === "system" ? systemTheme() : initial);
  }, []);

  useEffect(() => {
    const resolved = preference === "system" ? systemTheme() : preference;
    setResolved(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = systemTheme();
      setResolved(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    if (next === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setTheme((preference === "system" ? systemTheme() : preference) === "dark" ? "light" : "dark");
  }, [preference, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, preference, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside <ThemeProvider>");
  return value;
}
