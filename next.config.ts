import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  transpilePackages: [
    "@react-pdf-viewer/core",
    "@react-pdf-viewer/default-layout",
  ],

  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
