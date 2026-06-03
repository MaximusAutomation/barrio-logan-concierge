import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep dependencies lean for a frugal single-page guest site.
  // Serverless runtime handles Ollama via the nodejs runtime export in route.ts.
  images: {
    // OWNER NOTE: The PRIMARY way to add your own photos is to drop files into
    // /public/images/ and reference them as "/images/foo.jpg" in guide.json —
    // no allowlist entry needed for local files.
    //
    // Only add a remotePatterns entry here if you reference an external HTTPS
    // URL (e.g. a photo hosted on your own CDN or another service). See
    // OWNER-DEPLOY.md → "Swapping in your own photos" for full instructions.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
