"use client";

import { useEffect, useState } from "react";
import { hasCompletedOnboarding } from "@/lib/storage/user-profile";
import {
  KeyboardShortcutsDialog,
  useKeyboardShortcuts,
} from "./keyboard-shortcuts-dialog";
import { OnboardingDialog } from "./onboarding-dialog";
import { GoogleAuth, getStoredGoogleAuth } from "./google-auth";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

/**
 * Wrapper component that shows Google auth and onboarding on first run
 * Shows Google auth first, then onboarding with pre-filled name
 * Also manages global keyboard shortcuts
 */
export function OnboardingWrapper({ children }: OnboardingWrapperProps) {
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts();

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = hasCompletedOnboarding();
    const storedGoogleAuth = getStoredGoogleAuth();

    if (!completed) {
      if (!storedGoogleAuth) {
        // Show Google auth first
        setShowAuth(true);
      } else {
        // User is authenticated, show onboarding
        setGoogleUser(storedGoogleAuth);
        setShowOnboarding(true);
      }
    }
    
    setIsChecking(false);
  }, []);

  const handleAuthSuccess = (user: GoogleUser) => {
    setGoogleUser(user);
    setShowAuth(false);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Don't render children until we've checked onboarding status
  if (isChecking) {
    return null;
  }

  return (
    <>
      {showAuth && (
        <GoogleAuth open={showAuth} onAuthSuccess={handleAuthSuccess} />
      )}
      {showOnboarding && (
        <OnboardingDialog
          onComplete={handleOnboardingComplete}
          open={showOnboarding}
          googleUser={googleUser}
        />
      )}
      <KeyboardShortcutsDialog
        onOpenChange={setShowShortcuts}
        open={showShortcuts}
      />
      {children}
    </>
  );
}
