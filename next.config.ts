import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is bound on 0.0.0.0 and opened at 127.0.0.1. Next only
  // allows the bind hostname plus localhost, so the HMR socket from
  // 127.0.0.1 is rejected and the app never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
