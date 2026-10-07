import { getProductsApi } from '@/features/products/apis/product.api';
import { requireApiObject } from '@/shared/services/responseContract';
import { getSiteUrl } from '@/shared/utils/siteUrl';

export default async function sitemap() {
  const baseUrl = getSiteUrl();

  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about-us`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/size-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/how-to-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/orders/lookup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/return`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/payment`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/policies/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/policies/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  const res = await getProductsApi({ limit: 100 });
  const payload = requireApiObject(res, 'Sitemap products');
  if (!Array.isArray(payload.items)) throw new Error('Sitemap products payload is invalid');
  const productRoutes = payload.items.map((product) => ({
    url: `${baseUrl}/products/${product.slug_product}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
