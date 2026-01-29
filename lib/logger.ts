/**
 * Production-safe logger
 * Disables console logs in production environment
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    // Always show warnings
    console.warn(...args);
  },

  error: (...args: any[]) => {
    // Always show errors
    console.error(...args);
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  table: (...args: any[]) => {
    if (isDevelopment) {
      console.table(...args);
    }
  },
};

/**
 * Disable all console methods in production
 * Call this at app startup
 */
export function disableConsoleInProduction() {
  if (typeof window !== "undefined" && !isDevelopment) {
    const noop = () => {};

    // Override console methods (but keep error and warn)
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.table = noop;
    console.trace = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
  }
}
