"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { getStoredTheme, applyTheme } from "@/lib/themes";

function ThemeInitializer() {
  useEffect(() => {
    // Apply custom theme on mount
    const themeName = getStoredTheme();
    const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
    applyTheme(themeName, mode);
  }, []);
  
  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeInitializer />
      {children}
    </NextThemesProvider>
  );
}
