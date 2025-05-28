import type { NextConfig } from "next";
import { env } from "process";

const withTM = require("next-transpile-modules")([
  "framer-motion",
]); // pass the modules you would like to see transpiled

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = withTM({
  reactStrictMode: true,
  allowedDevOrigins: [(env.REPLIT_DOMAINS || "").split(",")[0]],
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        module: false,
      };
    }
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
});

module.exports = nextConfig;