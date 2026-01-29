import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        protocol: "https",
        //https://nextjs.org/docs/messages/next-image-unconfigured-host
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: isDevelopment
              ? // Development: Allow hot reload and localhost
                [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
                  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data: https://fonts.gstatic.com",
                  "connect-src 'self' ws: wss: https://api.anthropic.com https://accounts.google.com",
                  "frame-src https://accounts.google.com",
                  "frame-ancestors 'none'",
                ].join("; ")
              : // Production: Strict CSP
                [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-inline' https://accounts.google.com",
                  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
                  "img-src 'self' data: blob: https:",
                  "font-src 'self' data: https://fonts.gstatic.com",
                  "connect-src 'self' https://api.anthropic.com https://accounts.google.com",
                  "frame-src https://accounts.google.com",
                  "frame-ancestors 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                ].join("; "),
          },
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable browser XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Strict Transport Security (HTTPS enforcement)
          // Note: Only applies when served over HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
