export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gritmode.vn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/profile',
          '/profile/*',
          '/checkout',
          '/order-success/*',
          '/orders/*',
          '/payment/*',
          '/payments/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
