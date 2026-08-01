import type { NextConfig } from "next";

/** URL du back-end WUGAMS ERP (optionnel, défaut : instance Vercel déployée). */
const BACKEND_URL = process.env.BACKEND_URL ?? "https://wugames-holding-inc.vercel.app";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;


