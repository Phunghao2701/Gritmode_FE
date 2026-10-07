export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) throw new Error('NEXT_PUBLIC_SITE_URL is required to generate robots.txt');

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
