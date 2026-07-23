import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [],
    unoptimized: true, // Disable optimization for .jfif files
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
