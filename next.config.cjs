/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Asset origin for proxying uploads in dev
const ASSET_ORIGIN = process.env.ASSET_ORIGIN || 'https://digitalpromocodes.com';

const nextConfig = {
  // Explicitly set output mode for Vercel (not static export)
  output: 'standalone',
  images: {
    unoptimized: false, // Enable image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'digitalpromocodes.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      // Whop ImgProxy CDN hosts (primary fix for img-v2-prod errors)
      {
        protocol: 'https',
        hostname: 'img-v2-prod.whop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img-v2-stage.whop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.whop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.whop.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets-2-prod.whop.com',
        pathname: '/**',
      },
      // AWS S3 buckets (Whop stores assets on S3)
      {
        protocol: 'https',
        hostname: 's3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
      // Common CDN hosts for whop logos
      {
        protocol: 'https',
        hostname: 'cdn.whop.com',
      },
      {
        protocol: 'https',
        hostname: 'static.whop.xyz',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
      // Wildcard for any other https images
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    largePageDataBytes: 5 * 1024 * 1024, // 5MB
    optimizePackageImports: ['recharts', 'react-beautiful-dnd', '@heroicons/react'],
  },
  typescript: {
    // !! WARN !!
    // Temporarily ignore TypeScript errors
    // Remove this when Prisma Client is properly regenerated
    ignoreBuildErrors: true,
  },
  // Disable React strict mode to avoid double renders in development
  // This helps react-beautiful-dnd work properly in development
  reactStrictMode: false,
  // Bundle optimization for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false,
    // Optimize for modern browsers
    emotion: false,
  },
  // Modern JavaScript output with optimized transpilation
  swcMinify: true,
  // Remove unused code in production
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
    'recharts': {
      transform: 'recharts/lib/{{member}}',
    },
    'react-beautiful-dnd': {
      transform: 'react-beautiful-dnd/{{member}}',
    },
  },
  // Custom headers for sitemap files
  async headers() {
    return [
      // X-Robots-Tag ONLY for non-indexable paths (admin, API, private)
      // NOTE: Offer pages and homepage must NOT have X-Robots-Tag headers
      // Page-level robots metadata controls indexing for public pages
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      {
        source: '/__seo/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
      // Allow ISR caching for offer pages
      {
        source: '/offer/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      // Allow ISR caching for homepage
      {
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      // Strong caching for Next.js static assets
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Strong caching for Next.js image optimization
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Keep APIs private
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'max-age=0, s-maxage=0, must-revalidate' },
        ],
      },
      {
        source: '/sitemaps/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'max-age=0, s-maxage=0, must-revalidate' },
        ],
      },
      {
        source: '/data/graph/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=60' }, // 1 minute for graph files
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' },
          { key: 'Cache-Control', value: 'max-age=300, s-maxage=300' }, // 5 minutes
        ],
      },
      {
        source: "/data/pages/:path*.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=60, s-maxage=60, stale-while-revalidate=86400" }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  // Redirects for removed or renamed pages
  // NOTE: Legacy /whop/ redirects kept for backwards compatibility with old links
  // All destinations point to /offer/ (current canonical pattern)
  async redirects() {
    return [
      // Legacy /whop/ to /offer/ catchall (before specific redirects)
      {
        source: '/whop/:slug',
        destination: '/offer/:slug',
        permanent: true, // 301 redirect
      },
      // Redirect old Ayecon 1:1 mentorship page to lifetime membership
      // Handle both unencoded and encoded versions (uppercase and lowercase hex)
      {
        source: '/offer/ayecon-academy-1:1-mentorship',
        destination: '/offer/ayecon-academy-lifetime-membership',
        permanent: true, // 301 redirect
      },
      {
        source: '/offer/ayecon-academy-1%3A1-mentorship',
        destination: '/offer/ayecon-academy-lifetime-membership',
        permanent: true, // 301 redirect
      },
      {
        source: '/offer/ayecon-academy-1%3a1-mentorship',
        destination: '/offer/ayecon-academy-lifetime-membership',
        permanent: true, // 301 redirect
      },
      // External broken link redirect to homepage
      {
        source: '/maddenlegends/sweepstakes',
        destination: '/',
        permanent: true, // 301 redirect
      },
    ];
  },
  // Rewrites for data directory and asset proxying
  async rewrites() {
    return [
      // Note: sitemap.xml is now served directly from public/ as a static file
      {
        source: '/data/:path*',
        destination: '/api/data/:path*',
      },
      // Proxy /uploads to production in dev (for DB logo paths)
      {
        source: '/uploads/:path*',
        destination: `${ASSET_ORIGIN}/uploads/:path*`,
      },
    ];
  },
  // Temporarily disable custom webpack config to fix chunk loading issues
  // webpack: (config, { dev, isServer }) => {
  //   // Custom webpack config disabled until chunk naming is resolved
  //   return config;
  // },
};

module.exports = withBundleAnalyzer(nextConfig);