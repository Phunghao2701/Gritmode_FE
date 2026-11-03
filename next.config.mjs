import { withSentryConfig } from '@sentry/nextjs/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    VITE_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    VITE_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT:
      process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/forgot-password',
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: 'phunghao',
  project: 'gritmode-fe',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
