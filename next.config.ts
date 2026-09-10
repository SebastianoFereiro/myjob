import path from "node:path";

import type { NextConfig } from "next";

// Идентификатор деплоя (skew protection). Значение вшивается в сборку,
// поэтому должно быть одинаковым на всех инстансах PM2 одного релиза.
const deploymentId = (process.env.DEPLOYMENT_ID ?? process.env.GIT_SHA ?? "")
  .trim()
  .replace(/[^a-zA-Z0-9_-]/g, "");

const nextConfig: NextConfig = {
  ...(deploymentId
    ? {
        deploymentId,
        generateBuildId: async () => deploymentId,
      }
    : {}),
  // Общий кэш в Postgres: revalidateTag становится виден всем инстансам PM2.
  cacheHandler: path.join(process.cwd(), "cache-handler.js"),
  // Отключаем пер-инстансную память, иначе инстанс может отдавать устаревшее.
  cacheMaxMemorySize: 0,
  images: {
      qualities: [65, 75, 85, 95],
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
