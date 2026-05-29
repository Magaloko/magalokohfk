import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // V2 läuft als eigenständiges Vercel-Projekt (Root Directory = v2/).
  // Daten kommen aus derselben Supabase wie die Live-App.
  experimental: {},
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-DNS-Prefetch-Control", value: "off" },
        // Clickjacking-Schutz; Einbettung nur durch eigene Domain + Telegram (Mini-App).
        { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org" },
      ],
    }];
  },
};

export default nextConfig;
