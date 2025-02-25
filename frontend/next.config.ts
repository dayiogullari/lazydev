import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  reactStrictMode: true,

  onDemandEntries: {
    pagesBufferLength: 2,
  },
};

export default nextConfig;
