import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel deploys Node.js server — no need for static export
  // output: 'export' would break dynamic routes like /project/[slug]

  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    // Optimise all local photos through Next.js Image Optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Suppress known harmless warnings in production
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Improve bundle size — remove source maps in production
  productionBrowserSourceMaps: false,

  // Allow THREE.js and GLSL imports cleanly
  transpilePackages: ['three'],

  // Security + performance headers (also defined in vercel.json for CDN layer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/photos/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
