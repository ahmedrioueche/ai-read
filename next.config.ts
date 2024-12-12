import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
  // Ensure PDF.js worker is properly configured
  transpilePackages: [
    "@react-pdf-viewer/core",
    "@react-pdf-viewer/default-layout",
  ],
};

module.exports = nextConfig;
