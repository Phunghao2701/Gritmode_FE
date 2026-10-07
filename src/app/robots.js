import { getSiteUrl } from '@/shared/utils/siteUrl';

export default function robots() {
  const baseUrl = getSiteUrl();

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
