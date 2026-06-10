import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // ทำให้ build เป็น static
  output: "export",
  trailingSlash: true,

  // ถ้าใช้ next/image ต้องปิด optimize
  images: {
    unoptimized: true,
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

};

export default nextConfig;