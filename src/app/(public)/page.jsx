import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getCategoriesApi } from '@/features/categories/apis/category.api';
import { getProductsApi } from '@/features/products/apis/product.api';
import { buildCategoryTree } from '@/features/categories/utils/category.utils';
import { STOREFRONT_BANNERS_KEY, getActiveBannersApi } from '@/features/landing/hooks/useBanners';
import LandingPage from '@/features/landing/pages/LandingPage';
import { requireApiArray, requireApiObject } from '@/shared/services/responseContract';

export const metadata = {  description:
    'Gritmode® — Thương hiệu thời trang thể thao & phong cách đường phố cao cấp lấy cảm hứng từ DirtyCoins và văn hóa Hip-Hop đương đại.',
  openGraph: {    description: 'Thương hiệu thời trang thể thao & phong cách đường phố cao cấp.',
    type: 'website',
  },
};

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch Banners & Hero settings for instant zero-delay presentation
  await queryClient.prefetchQuery({
    queryKey: STOREFRONT_BANNERS_KEY,
    queryFn: getActiveBannersApi,
  });

  // Prefetch Categories for MegaMenu and filter tabs
  await queryClient.prefetchQuery({
    queryKey: ['categories-public-tree'],
    queryFn: async () => {
      const res = await getCategoriesApi();
      return buildCategoryTree(requireApiArray(res, 'Danh mục trang chủ'));
    },
  });

  // Prefetch Products for Landing Hero / Newest products list
  await queryClient.prefetchQuery({
    queryKey: ['products', { category_id: undefined, sort: 'newest', limit: 15 }],
    queryFn: async () => {
      const res = await getProductsApi({ category_id: undefined, sort: 'newest', limit: 15 });
      const raw = requireApiObject(res, 'Sản phẩm trang chủ');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Sản phẩm trang chủ không hợp lệ');
      return raw;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPage />
    </HydrationBoundary>
  );
}
