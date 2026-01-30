"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/themes";

function ThemeInitializer() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Wait for theme to be resolved before applying
    if (!resolvedTheme) {
      console.log("[ThemeInitializer] Waiting for resolvedTheme...");
      return;
    }
    
    console.log("[ThemeInitializer] Resolved theme mode:", resolvedTheme);
    
    // Apply custom theme when component mounts or theme mode changes
    const themeName = getStoredTheme();
    const mode = resolvedTheme === "dark" ? "dark" : "light";
    
    console.log("[ThemeInitializer] Loading theme:", themeName, "mode:", mode);
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
