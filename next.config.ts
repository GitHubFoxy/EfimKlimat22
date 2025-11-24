import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "212.67.9.127",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
