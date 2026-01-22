import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.klimat22.com',
        pathname: '/api/storage/**',
      },
    ],
  },
}

export default nextConfig
