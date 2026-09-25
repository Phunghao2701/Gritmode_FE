import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getCategoriesApi } from '@/features/categories/apis/category.api';
import { getProductsApi } from '@/features/products/apis/product.api';
import { buildCategoryTree } from '@/features/categories/utils/category.utils';
import LandingPage from '@/features/landing/pages/LandingPage';

export const metadata = {
  title: 'Gritmode® | Vietnamese Streetwear Culture',
  description:
    'Gritmode® — Thương hiệu thời trang thể thao & phong cách đường phố cao cấp lấy cảm hứng từ DirtyCoins và văn hóa Hip-Hop đương đại.',
  openGraph: {
    title: 'Gritmode® | Vietnamese Streetwear Culture',
    description: 'Thương hiệu thời trang thể thao & phong cách đường phố cao cấp.',
    type: 'website',
  },
};

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch Categories for MegaMenu and filter tabs
  await queryClient.prefetchQuery({
    queryKey: ['categories-public-tree'],
    queryFn: async () => {
      try {
        const res = await getCategoriesApi();
        const data = res.data?.data || res.data || [];
        return buildCategoryTree(Array.isArray(data) ? data : []);
      } catch {
        return [];
      }
    },
  });

  // Prefetch Products for Landing Hero / Newest products list
  await queryClient.prefetchQuery({
    queryKey: ['products', { category_id: undefined, sort: 'newest', limit: 15 }],
    queryFn: async () => {
      try {
        const res = await getProductsApi({ category_id: undefined, sort: 'newest', limit: 15 });
        const raw = res.data?.data || res.data;
        if (Array.isArray(raw)) {
          return {
            items: raw,
            pagination: { page: 1, limit: raw.length, total: raw.length, total_pages: 1 },
          };
        }
        return {
          items: raw?.items || [],
          pagination: raw?.pagination || {
            page: 1,
            limit: 15,
            total: raw?.items?.length || 0,
            total_pages: 1,
          },
        };
      } catch {
        return { items: [], pagination: { page: 1, limit: 15, total: 0, total_pages: 1 } };
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPage />
    </HydrationBoundary>
  );
}
