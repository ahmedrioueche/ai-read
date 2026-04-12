import { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty.js",
      },
    },
  },
  transpilePackages: [
    "@react-pdf-viewer/core",
    "@react-pdf-viewer/default-layout",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
