"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/themes";

function ThemeInitializer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Apply custom theme when component mounts or theme mode changes
    const themeName = getStoredTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    applyTheme(themeName, mode);
  }, [resolvedTheme]); // Re-apply when light/dark mode changes

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
