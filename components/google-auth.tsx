"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Google icon component
function GoogleIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface GoogleAuthProps {
  onAuthSuccess: (user: GoogleUser) => void;
  onSkip?: () => void;
  open: boolean;
}

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              text?: string;
              width?: number;
            }
          ) => void;
          prompt: (
            notification?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              isDismissedMoment: () => boolean;
              getNotDisplayedReason: () => string;
              getSkippedReason: () => string;
              getDismissedReason: () => string;
            }) => void
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token: string;
              error?: string;
            }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export function GoogleAuth({ onAuthSuccess, onSkip, open }: GoogleAuthProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSuccess = (user: GoogleUser) => {
    try {
      // Store auth info
      localStorage.setItem("google_auth", JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err) {
      console.error("Failed to save auth info:", err);
      setError("Failed to authenticate with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS" && event.data.user) {
        handleAuthSuccess(event.data.user);
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        setError(event.data.error || "Authentication failed");
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [open]);

  const handleCustomGoogleSignIn = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    if (!clientId) {
      setError(
        "Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env file."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Build OAuth URL with proper parameters for implicit flow
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = "openid email profile";
    const responseType = "id_token token";
    const nonce = Math.random().toString(36).substring(2);

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", responseType);
    authUrl.searchParams.set("scope", scope);
    authUrl.searchParams.set("nonce", nonce);
    authUrl.searchParams.set("prompt", "select_account");

    // Open popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      "Google Sign In",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setError("Popup blocked. Please allow popups for this site.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[450px] bg-card !border-[#2a2836] shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="rounded-2xl bg-primary/5 p-4">
              <img
                alt="Enable Logo"
                className="h-12 w-auto object-contain"
                src="/logo.svg"
              />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center font-semibold">
            Welcome
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {onSkip 
              ? "Sign in with Google for a personalized experience, or continue as a guest"
              : "Sign in with your Google account to get started"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          {error ? (
            <div className="text-center space-y-4 p-4 rounded-lg bg-destructive/10">
              <p className="text-destructive text-sm">{error}</p>
              <Button
                className="mt-2"
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Custom styled button */}
              <Button
                className="w-full max-w-sm h-12 gap-3 bg-background hover:bg-accent hover:border-primary/50 text-foreground border border-[#2a2836] shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                onClick={handleCustomGoogleSignIn}
                type="button"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="font-medium">Connecting...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span className="font-medium">Continue with Google</span>
                  </>
                )}
              </Button>
              
              {/* Skip button */}
              {onSkip && (
                <Button
                  className="w-full max-w-sm"
                  disabled={isLoading}
                  onClick={onSkip}
                  type="button"
                  variant="ghost"
                >
                  Continue as Guest
                </Button>
              )}
            </>
          )}
        </div>

        <div className="text-center text-muted-foreground text-xs space-y-2 pt-4 border-t border-[#2a2836]/30">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="flex items-center justify-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
            Your data is stored locally and never sent to our servers
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getStoredGoogleAuth(): GoogleUser | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("google_auth");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as GoogleUser;
  } catch {
    return null;
  }
}

export function clearGoogleAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("google_auth");
}
