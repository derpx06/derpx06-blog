"use client";

import React, { useEffect, useState } from "react";
import { Row, ToggleButton, useTheme } from "@once-ui-system/core";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("data-theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("data-theme");
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    } else {
      setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
    }
  }, [theme]);

  const getNextTheme = () => {
    return currentTheme === 'light' ? 'dark' : 'light';
  };

  const getIcon = (theme: string) => {
    return currentTheme === 'light' ? 'dark' : 'light';
  };

  const nextTheme = getNextTheme();
  const icon = getIcon(currentTheme);

  return (
    <ToggleButton
      prefixIcon={icon}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
    />
  );
};
