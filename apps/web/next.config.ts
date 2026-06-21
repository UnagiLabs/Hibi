import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBaseUrl = (process.env.HIBI_API_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");

    return [
      {
        source: "/api/media/:path*",
        destination: `${apiBaseUrl}/api/media/:path*`
      }
    ];
  },
  turbopack: {
    root: resolve(appDir, "../..")
  }
};

export default nextConfig;
