/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID || '',
  },
  images: {
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

export default nextConfig;
