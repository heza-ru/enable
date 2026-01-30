/**
 * Theme System for Enable
 * Supports multiple color themes with smooth transitions
 */

export type ThemeName =
  | "light"
  | "dark"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight"
  | "lavender"
  | "rose";

export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
}

interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

// Helper function to create complete theme colors from base colors
function createThemeColors(base: Partial<ThemeColors>): ThemeColors {
  return {
    background: base.background || "0 0% 100%",
    foreground: base.foreground || "240 10% 3.9%",
    card: base.card || base.background || "0 0% 100%",
    cardForeground: base.cardForeground || base.foreground || "240 10% 3.9%",
    popover: base.popover || base.card || base.background || "0 0% 100%",
    popoverForeground: base.popoverForeground || base.foreground || "240 10% 3.9%",
    primary: base.primary || "240 5.9% 10%",
    primaryForeground: base.primaryForeground || "0 0% 98%",
    secondary: base.secondary || "240 4.8% 95.9%",
    secondaryForeground: base.secondaryForeground || base.foreground || "240 5.9% 10%",
    muted: base.muted || base.secondary || "240 4.8% 95.9%",
    mutedForeground: base.mutedForeground || "240 3.8% 46.1%",
    accent: base.accent || base.secondary || "240 4.8% 95.9%",
    accentForeground: base.accentForeground || base.foreground || "240 5.9% 10%",
    destructive: base.destructive || "0 84.2% 60.2%",
    destructiveForeground: base.destructiveForeground || "0 0% 98%",
    border: base.border || "240 5.9% 90%",
    input: base.input || base.border || "240 5.9% 85%",
    ring: base.ring || base.primary || "240 10% 3.9%",
  };
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    id: "light",
    name: "Light",
    description: "Clean and bright default theme",
    colors: {
      light: createThemeColors({
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        card: "0 0% 100%",
        cardForeground: "240 10% 3.9%",
        popover: "0 0% 100%",
        popoverForeground: "240 10% 3.9%",
        primary: "240 5.9% 10%",
        primaryForeground: "0 0% 98%",
        secondary: "240 4.8% 92%",
        secondaryForeground: "240 5.9% 10%",
        muted: "240 4.8% 93%",
        mutedForeground: "240 3.8% 46.1%",
        accent: "240 4.8% 92%",
        accentForeground: "240 5.9% 10%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "0 0% 98%",
        border: "220 10% 65%",
        input: "240 5.9% 85%",
        ring: "240 10% 3.9%",
      }),
      dark: createThemeColors({
        background: "240 10% 3.9%",
        foreground: "0 0% 98%",
        card: "240 10% 3.9%",
        cardForeground: "0 0% 98%",
        popover: "240 10% 3.9%",
        popoverForeground: "0 0% 98%",
        primary: "0 0% 98%",
        primaryForeground: "240 5.9% 10%",
        secondary: "240 3.7% 15.9%",
        secondaryForeground: "0 0% 98%",
        muted: "240 3.7% 15.9%",
        mutedForeground: "240 5% 64.9%",
        accent: "240 3.7% 15.9%",
        accentForeground: "0 0% 98%",
        destructive: "0 62.8% 30.6%",
        destructiveForeground: "0 0% 98%",
        border: "240 3.7% 20%",
        input: "240 3.7% 15.9%",
        ring: "240 4.9% 83.9%",
      }),
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes dark theme",
    colors: {
      light: createThemeColors({
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        primary: "240 5.9% 10%",
        border: "240 5.9% 90%",
      }),
      dark: createThemeColors({
        background: "240 10% 3.9%",
        foreground: "0 0% 98%",
        card: "240 10% 3.9%",
        cardForeground: "0 0% 98%",
        primary: "0 0% 98%",
        border: "240 3.7% 15.9%",
      }),
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue tones inspired by the sea",
    colors: {
      light: createThemeColors({
        background: "210 100% 99%",
        foreground: "210 40% 10%",
        card: "210 100% 99%",
        cardForeground: "210 40% 10%",
        primary: "207 90% 45%",
        primaryForeground: "0 0% 100%",
        secondary: "210 40% 96%",
        secondaryForeground: "210 40% 10%",
        muted: "210 40% 96%",
        mutedForeground: "210 20% 40%",
        accent: "197 71% 73%",
        accentForeground: "210 40% 10%",
        border: "210 40% 88%",
        ring: "207 90% 45%",
      }),
      dark: createThemeColors({
        background: "218 40% 8%",
        foreground: "210 40% 98%",
        card: "218 40% 8%",
        cardForeground: "210 40% 98%",
        primary: "199 89% 48%",
        primaryForeground: "210 40% 10%",
        secondary: "218 40% 15%",
        secondaryForeground: "210 40% 98%",
        muted: "218 40% 15%",
        mutedForeground: "210 20% 65%",
        accent: "199 89% 48%",
        accentForeground: "0 0% 100%",
        border: "218 40% 18%",
        ring: "199 89% 48%",
      }),
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    description: "Natural green tones inspired by nature",
    colors: {
      light: createThemeColors({
        background: "140 50% 99%",
        foreground: "140 30% 10%",
        card: "140 50% 99%",
        cardForeground: "140 30% 10%",
        primary: "142 71% 35%",
        primaryForeground: "0 0% 100%",
        secondary: "140 30% 96%",
        secondaryForeground: "140 30% 10%",
        muted: "140 30% 96%",
        mutedForeground: "140 20% 40%",
        accent: "142 71% 45%",
        accentForeground: "140 30% 10%",
        border: "140 30% 88%",
        ring: "142 71% 35%",
      }),
      dark: createThemeColors({
        background: "140 40% 8%",
        foreground: "140 30% 98%",
        card: "140 40% 8%",
        cardForeground: "140 30% 98%",
        primary: "142 71% 45%",
        primaryForeground: "140 30% 10%",
        secondary: "140 40% 15%",
        secondaryForeground: "140 30% 98%",
        muted: "140 40% 15%",
        mutedForeground: "140 20% 65%",
        accent: "142 71% 45%",
        accentForeground: "0 0% 100%",
        border: "140 40% 18%",
        ring: "142 71% 45%",
      }),
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink tones",
    colors: {
      light: createThemeColors({
        background: "30 100% 99%",
        foreground: "30 40% 10%",
        card: "30 100% 99%",
        cardForeground: "30 40% 10%",
        primary: "14 100% 57%",
        primaryForeground: "0 0% 100%",
        secondary: "30 40% 96%",
        secondaryForeground: "30 40% 10%",
        muted: "30 40% 96%",
        mutedForeground: "30 20% 40%",
        accent: "340 75% 60%",
        accentForeground: "0 0% 100%",
        border: "30 40% 88%",
        ring: "14 100% 57%",
      }),
      dark: createThemeColors({
        background: "25 40% 8%",
        foreground: "30 40% 98%",
        card: "25 40% 8%",
        cardForeground: "30 40% 98%",
        primary: "14 100% 57%",
        primaryForeground: "25 40% 8%",
        secondary: "25 40% 15%",
        secondaryForeground: "30 40% 98%",
        muted: "25 40% 15%",
        mutedForeground: "30 20% 65%",
        accent: "340 75% 60%",
        accentForeground: "0 0% 100%",
        border: "25 40% 18%",
        ring: "14 100% 57%",
      }),
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue midnight tones",
    colors: {
      light: createThemeColors({
        background: "220 30% 99%",
        foreground: "220 40% 10%",
        card: "220 30% 99%",
        cardForeground: "220 40% 10%",
        primary: "221 83% 35%",
        primaryForeground: "0 0% 100%",
        secondary: "220 30% 96%",
        secondaryForeground: "220 40% 10%",
        muted: "220 30% 96%",
        mutedForeground: "220 20% 40%",
        accent: "221 83% 45%",
        accentForeground: "0 0% 100%",
        border: "220 30% 88%",
        ring: "221 83% 35%",
      }),
      dark: createThemeColors({
        background: "222 47% 5%",
        foreground: "220 30% 98%",
        card: "222 47% 5%",
        cardForeground: "220 30% 98%",
        primary: "217 91% 60%",
        primaryForeground: "222 47% 5%",
        secondary: "222 47% 12%",
        secondaryForeground: "220 30% 98%",
        muted: "222 47% 12%",
        mutedForeground: "220 20% 65%",
        accent: "217 91% 60%",
        accentForeground: "222 47% 5%",
        border: "222 47% 18%",
        ring: "217 91% 60%",
      }),
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple and lavender tones",
    colors: {
      light: createThemeColors({
        background: "270 50% 99%",
        foreground: "270 30% 10%",
        card: "270 50% 99%",
        cardForeground: "270 30% 10%",
        primary: "262 52% 47%",
        primaryForeground: "0 0% 100%",
        secondary: "270 30% 96%",
        secondaryForeground: "270 30% 10%",
        muted: "270 30% 96%",
        mutedForeground: "270 20% 40%",
        accent: "280 60% 65%",
        accentForeground: "270 30% 10%",
        border: "270 30% 88%",
        ring: "262 52% 47%",
      }),
      dark: createThemeColors({
        background: "265 40% 8%",
        foreground: "270 30% 98%",
        card: "265 40% 8%",
        cardForeground: "270 30% 98%",
        primary: "270 70% 60%",
        primaryForeground: "265 40% 8%",
        secondary: "265 40% 15%",
        secondaryForeground: "270 30% 98%",
        muted: "265 40% 15%",
        mutedForeground: "270 20% 65%",
        accent: "280 60% 65%",
        accentForeground: "265 40% 8%",
        border: "265 40% 18%",
        ring: "270 70% 60%",
      }),
    },
  },
  rose: {
    id: "rose",
    name: "Rose",
    description: "Elegant pink and rose tones",
    colors: {
      light: createThemeColors({
        background: "350 50% 99%",
        foreground: "350 30% 10%",
        card: "350 50% 99%",
        cardForeground: "350 30% 10%",
        primary: "346 77% 50%",
        primaryForeground: "0 0% 100%",
        secondary: "350 30% 96%",
        secondaryForeground: "350 30% 10%",
        muted: "350 30% 96%",
        mutedForeground: "350 20% 40%",
        accent: "346 77% 60%",
        accentForeground: "0 0% 100%",
        border: "350 30% 88%",
        ring: "346 77% 50%",
      }),
      dark: createThemeColors({
        background: "345 40% 8%",
        foreground: "350 30% 98%",
        card: "345 40% 8%",
        cardForeground: "350 30% 98%",
        primary: "346 77% 60%",
        primaryForeground: "345 40% 8%",
        secondary: "345 40% 15%",
        secondaryForeground: "350 30% 98%",
        muted: "345 40% 15%",
        mutedForeground: "350 20% 65%",
        accent: "346 77% 60%",
        accentForeground: "345 40% 8%",
        border: "345 40% 18%",
        ring: "346 77% 60%",
      }),
    },
  },
};

// Get theme from localStorage
export function getStoredTheme(): ThemeName {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = localStorage.getItem("enable_theme");
    if (stored && stored in themes) {
      return stored as ThemeName;
    }
  } catch (error) {
    console.error("Failed to get stored theme:", error);
  }

  return "dark";
}

// Save theme to localStorage
export function saveTheme(theme: ThemeName): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("enable_theme", theme);
    console.log("[Theme] Saved theme to localStorage:", theme);
  } catch (error) {
    console.error("Failed to save theme:", error);
  }
}

// Apply theme to document
export function applyTheme(
  themeName: ThemeName,
  mode: "light" | "dark" = "dark"
): void {
  if (typeof window === "undefined") return;

  const theme = themes[themeName];
  if (!theme) {
    console.error(`[Theme] Theme "${themeName}" not found`);
    return;
  }

  const colors = theme.colors[mode];
  const root = document.documentElement;

  console.log(`[Theme] Applying theme: ${themeName} (${mode} mode)`);
  console.log("[Theme] Colors:", colors);

  // Apply ALL CSS variables
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", colors.cardForeground);
  root.style.setProperty("--popover", colors.popover);
  root.style.setProperty("--popover-foreground", colors.popoverForeground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--destructive", colors.destructive);
  root.style.setProperty("--destructive-foreground", colors.destructiveForeground);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--input", colors.input);
  root.style.setProperty("--ring", colors.ring);

  // Verify the variables were set
  console.log("[Theme] Verified --card:", root.style.getPropertyValue("--card"));
  console.log("[Theme] Verified --primary:", root.style.getPropertyValue("--primary"));

  // Save theme
  saveTheme(themeName);
  
  console.log("[Theme] Theme applied and saved successfully");
}
