"use client";

import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    const processAuth = async () => {
      try {
        // Extract tokens from the URL fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');
        const error = params.get('error');

        console.log('OAuth callback received:', { hasIdToken: !!idToken, hasAccessToken: !!accessToken, error });

        if (error) {
          // Send error to opener
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: `Authentication failed: ${error}` },
              window.location.origin
            );
          }
          setTimeout(() => window.close(), 1000);
          return;
        }

        if (!idToken) {
          if (window.opener) {
            window.opener.postMessage(
              { type: 'GOOGLE_AUTH_ERROR', error: 'No ID token received from Google' },
              window.location.origin
            );
          }
          setTimeout(() => window.close(), 1000);
          return;
        }

        // Decode JWT to get user info
        const base64Url = idToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
        );

        const user = JSON.parse(jsonPayload);

        // Send user data to opener window
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { 
              type: 'GOOGLE_AUTH_SUCCESS', 
              user: {
                email: user.email,
                name: user.name,
                picture: user.picture,
                sub: user.sub,
              }
            },
            window.location.origin
          );
        }

        // Close popup after a short delay
        setTimeout(() => window.close(), 500);
      } catch (err) {
        console.error('Failed to process authentication:', err);
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            { type: 'GOOGLE_AUTH_ERROR', error: 'Failed to process authentication token' },
            window.location.origin
          );
        }
        setTimeout(() => window.close(), 1000);
      }
    };

    processAuth();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
