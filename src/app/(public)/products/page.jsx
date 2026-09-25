import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getCategoriesApi } from '@/features/categories/apis/category.api';
import { getProductsApi } from '@/features/products/apis/product.api';
import { buildCategoryTree } from '@/features/categories/utils/category.utils';
import ProductListPage from '@/features/products/pages/ProductListPage';
import LoadingSkeleton from '@/shared/components/LoadingSkeleton';

export const metadata = {
  title: 'Bộ Sưu Tập Sản Phẩm | Gritmode® Streetwear',
  description: 'Khám phá tất cả các thiết kế thời trang đường phố cao cấp mới nhất từ Gritmode®.',
  openGraph: {
    title: 'Bộ Sưu Tập Sản Phẩm | Gritmode® Streetwear',
    description: 'Khám phá tất cả các thiết kế thời trang đường phố cao cấp mới nhất từ Gritmode®.',
    type: 'website',
  },
};

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const queryClient = getQueryClient();

  // Prefetch categories
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

  // Prefetch products based on searchParams
  const params = {
    ...(sp?.category ? { categorySlug: sp.category } : sp?.category_id ? { category_id: sp.category_id } : {}),
    ...(sp?.collection ? { collectionSlug: sp.collection } : sp?.collection_id ? { collection_id: sp.collection_id } : {}),
    search: sp?.search?.trim() || undefined,
    sort: sp?.sort || 'newest',
    page: Number(sp?.page) || 1,
    limit: 20,
  };

  await queryClient.prefetchQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const res = await getProductsApi(params);
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
            page: params.page,
            limit: 20,
            total: raw?.items?.length || 0,
            total_pages: 1,
          },
        };
      } catch {
        return { items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 1 } };
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className="max-w-[1400px] mx-auto p-8"><LoadingSkeleton height="h-96" /></div>}>
        <ProductListPage key={sp?.category || sp?.category_id || sp?.collection || sp?.collection_id || sp?.search || 'all'} />
      </Suspense>
    </HydrationBoundary>
  );
}
