/**
 * Responsive breakpoints and utilities for Enable
 * Optimized for MacBook 13", 15", monitors, and mobile devices
 */

export const breakpoints = {
  // Mobile first
  mobile: "320px", // Small phones
  sm: "640px", // Large phones
  md: "768px", // Tablets
  lg: "1024px", // Small laptops
  macbook13: "1440px", // MacBook 13" (2880x1800 effective)
  xl: "1280px", // Standard laptops
  macbook15: "1680px", // MacBook 15" (3360x2100 effective)
  "2xl": "1536px", // Large monitors
  "3xl": "1920px", // Full HD monitors
  "4xl": "2560px", // 2K monitors
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Media query utilities
 */
export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.sm})`,
  tablet: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  laptop: `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.macbook15})`,
  desktop: `@media (min-width: ${breakpoints.macbook15})`,

  // Specific devices
  macbook13: `@media (min-width: ${breakpoints.macbook13}) and (max-width: ${breakpoints.macbook15})`,
  macbook15: `@media (min-width: ${breakpoints.macbook15})`,

  // Orientation
  portrait: "@media (orientation: portrait)",
  landscape: "@media (orientation: landscape)",

  // Touch devices
  touch: "@media (hover: none) and (pointer: coarse)",
  mouse: "@media (hover: hover) and (pointer: fine)",
} as const;

/**
 * Responsive spacing scale
 */
export const spacing = {
  mobile: {
    section: "1rem", // 16px
    component: "0.75rem", // 12px
    element: "0.5rem", // 8px
  },
  tablet: {
    section: "1.5rem", // 24px
    component: "1rem", // 16px
    element: "0.75rem", // 12px
  },
  desktop: {
    section: "2rem", // 32px
    component: "1.5rem", // 24px
    element: "1rem", // 16px
  },
} as const;

/**
 * Responsive font scales
 */
export const fontSizes = {
  mobile: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
  },
  desktop: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.375rem", // 22px
    "2xl": "1.75rem", // 28px
    "3xl": "2.25rem", // 36px
  },
} as const;

/**
 * Container max widths for different screens
 */
export const containers = {
  mobile: "100%",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  macbook13: "1280px", // Optimized for MacBook 13"
  xl: "1280px",
  macbook15: "1440px", // Optimized for MacBook 15"
  "2xl": "1536px",
  "3xl": "1728px", // For large monitors
} as const;

/**
 * Utility function to check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * Utility function to check if device is tablet
 */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Utility function to check if device is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}

/**
 * Utility function to get current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "mobile";

  const width = window.innerWidth;

  if (width >= 2560) return "4xl";
  if (width >= 1920) return "3xl";
  if (width >= 1680) return "macbook15";
  if (width >= 1536) return "2xl";
  if (width >= 1440) return "macbook13";
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "mobile";
}

/**
 * Hook to get responsive value based on current breakpoint
 */
export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  defaultValue: T
): T {
  const breakpoint = getCurrentBreakpoint();
  return values[breakpoint] ?? defaultValue;
}
