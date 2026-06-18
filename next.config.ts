import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atlantis.myjob.by",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
