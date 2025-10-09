import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "purple-sophisticated-scorpion-935.mypinata.cloud", // 👈 your IPFS gateway
      "gateway.pinata.cloud", // (optional fallback)
      "ipfs.io" // (optional)
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}

export default nextConfig
