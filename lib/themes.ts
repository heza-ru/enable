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
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    id: "light",
    name: "Light",
    description: "Clean and bright default theme",
    colors: {
      light: {
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        primary: "240 5.9% 10%",
        primaryForeground: "0 0% 98%",
        secondary: "240 4.8% 95.9%",
        secondaryForeground: "240 5.9% 10%",
        muted: "240 4.8% 95.9%",
        mutedForeground: "240 3.8% 46.1%",
        accent: "240 4.8% 95.9%",
        accentForeground: "240 5.9% 10%",
        border: "240 5.9% 90%",
        ring: "240 10% 3.9%",
      },
      dark: {
        background: "240 10% 3.9%",
        foreground: "0 0% 98%",
        primary: "0 0% 98%",
        primaryForeground: "240 5.9% 10%",
        secondary: "240 3.7% 15.9%",
        secondaryForeground: "0 0% 98%",
        muted: "240 3.7% 15.9%",
        mutedForeground: "240 5% 64.9%",
        accent: "240 3.7% 15.9%",
        accentForeground: "0 0% 98%",
        border: "240 3.7% 15.9%",
        ring: "240 4.9% 83.9%",
      },
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    description: "Easy on the eyes dark theme",
    colors: {
      light: {
        background: "0 0% 100%",
        foreground: "240 10% 3.9%",
        primary: "240 5.9% 10%",
        primaryForeground: "0 0% 98%",
        secondary: "240 4.8% 95.9%",
        secondaryForeground: "240 5.9% 10%",
        muted: "240 4.8% 95.9%",
        mutedForeground: "240 3.8% 46.1%",
        accent: "240 4.8% 95.9%",
        accentForeground: "240 5.9% 10%",
        border: "240 5.9% 90%",
        ring: "240 10% 3.9%",
      },
      dark: {
        background: "240 10% 3.9%",
        foreground: "0 0% 98%",
        primary: "0 0% 98%",
        primaryForeground: "240 5.9% 10%",
        secondary: "240 3.7% 15.9%",
        secondaryForeground: "0 0% 98%",
        muted: "240 3.7% 15.9%",
        mutedForeground: "240 5% 64.9%",
        accent: "240 3.7% 15.9%",
        accentForeground: "0 0% 98%",
        border: "240 3.7% 15.9%",
        ring: "240 4.9% 83.9%",
      },
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue tones inspired by the sea",
    colors: {
      light: {
        background: "210 100% 99%",
        foreground: "210 40% 10%",
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
      },
      dark: {
        background: "218 40% 8%",
        foreground: "210 40% 98%",
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
      },
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    description: "Natural green tones inspired by nature",
    colors: {
      light: {
        background: "140 50% 99%",
        foreground: "140 30% 10%",
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
      },
      dark: {
        background: "140 40% 8%",
        foreground: "140 30% 98%",
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
      },
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    description: "Warm orange and pink tones",
    colors: {
      light: {
        background: "30 100% 99%",
        foreground: "30 40% 10%",
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
      },
      dark: {
        background: "25 40% 8%",
        foreground: "30 40% 98%",
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
      },
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Deep blue midnight tones",
    colors: {
      light: {
        background: "220 30% 99%",
        foreground: "220 40% 10%",
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
      },
      dark: {
        background: "222 47% 5%",
        foreground: "220 30% 98%",
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
      },
    },
  },
  lavender: {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple and lavender tones",
    colors: {
      light: {
        background: "270 50% 99%",
        foreground: "270 30% 10%",
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
      },
      dark: {
        background: "265 40% 8%",
        foreground: "270 30% 98%",
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
      },
    },
  },
  rose: {
    id: "rose",
    name: "Rose",
    description: "Elegant pink and rose tones",
    colors: {
      light: {
        background: "350 50% 99%",
        foreground: "350 30% 10%",
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
      },
      dark: {
        background: "345 40% 8%",
        foreground: "350 30% 98%",
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
      },
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
  } catch (error) {
    console.error("Failed to save theme:", error);
  }
}

// Apply theme to document
export function applyTheme(themeName: ThemeName, mode: "light" | "dark" = "dark"): void {
  if (typeof window === "undefined") return;
  
  const theme = themes[themeName];
  if (!theme) return;
  
  const colors = theme.colors[mode];
  const root = document.documentElement;
  
  // Apply CSS variables
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--ring", colors.ring);
  
  // Save theme
  saveTheme(themeName);
}
