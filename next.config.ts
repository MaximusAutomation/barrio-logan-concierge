import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dependencies lean for a frugal single-page guest site.
  // Serverless runtime handles Ollama via the nodejs runtime export in route.ts.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
