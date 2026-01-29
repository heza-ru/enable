"use client";

import { useEffect } from "react";
import { disableConsoleInProduction } from "@/lib/logger";

/**
 * Component that disables console logs in production
 * Mount this once at the app root
 */
export function ConsoleGuard() {
  useEffect(() => {
    disableConsoleInProduction();
  }, []);

  return null;
}
