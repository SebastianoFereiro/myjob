import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atlantis.myjob.by",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "10.0.15.202",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
