import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      // DiceBear — algorithmically generated, MIT-licensed avatars & shapes
      // (no real people, safe for commercial & open-source use).
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
