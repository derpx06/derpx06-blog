"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme";

export function ThemeSwitch() {
  const { theme, toggle } = useTheme();
  // Icons only become meaningful once the stored preference is known.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      className="ds-box"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      style={{ display: "inline-flex", alignItems: "center", padding: "9px 11px" }}
    >
      {mounted && theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
    </button>
  );
}
