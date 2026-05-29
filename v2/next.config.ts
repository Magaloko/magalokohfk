import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // V2 läuft als eigenständiges Vercel-Projekt (Root Directory = v2/).
  // Daten kommen aus derselben Supabase wie die Live-App.
  experimental: {},
};

export default nextConfig;
