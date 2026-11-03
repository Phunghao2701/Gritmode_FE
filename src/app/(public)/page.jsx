import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getCategoriesApi } from '@/features/categories/apis/category.api';
import { buildCategoryTree } from '@/features/categories/utils/category.utils';
import { STOREFRONT_BANNERS_KEY, getActiveBannersApi } from '@/features/landing/hooks/useBanners';
import LandingPage from '@/features/landing/pages/LandingPage';
import { requireApiArray } from '@/shared/services/responseContract';

// Keep banner and category data request-rendered; the product list loads through
// one browser query, while backend Redis handles catalog reuse.
export const dynamic = 'force-dynamic';

export const metadata = {  description:
    'Gritmode® — Thương hiệu thời trang thể thao & phong cách đường phố cao cấp lấy cảm hứng từ DirtyCoins và văn hóa Hip-Hop đương đại.',
  openGraph: {    description: 'Thương hiệu thời trang thể thao & phong cách đường phố cao cấp.',
    type: 'website',
  },
};

export default async function HomePage() {
  const queryClient = getQueryClient();

  // Prefetch Banners & Hero settings for instant zero-delay presentation
  const bannersPrefetch = queryClient.prefetchQuery({
    queryKey: STOREFRONT_BANNERS_KEY,
    queryFn: getActiveBannersApi,
  });

  // Prefetch Categories for MegaMenu and filter tabs
  const categoriesPrefetch = queryClient.prefetchQuery({
    queryKey: ['categories-public-tree'],
    queryFn: async () => {
      const res = await getCategoriesApi();
      return buildCategoryTree(requireApiArray(res, 'Danh mục trang chủ'));
    },
  });

  await Promise.all([bannersPrefetch, categoriesPrefetch]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPage />
    </HydrationBoundary>
  );
}
