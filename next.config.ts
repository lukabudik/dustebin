import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare proxy to work properly
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Forwarded-Proto',
            value: 'https',
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
