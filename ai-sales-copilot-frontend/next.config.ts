import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent double-mount of WebSocket connections in dev
  reactStrictMode: false,
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
