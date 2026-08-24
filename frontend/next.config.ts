import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      // DiceBear — algorithmically generated, MIT-licensed avatars & shapes
      // (no real people, safe for commercial & open-source use).
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    return [{ source: "/media/:path*", destination: "http://api:8000/media/:path*" }];
  },
};

export default nextConfig;
