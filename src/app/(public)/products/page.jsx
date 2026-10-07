import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getCategoriesApi } from '@/features/categories/apis/category.api';
import { getProductsApi } from '@/features/products/apis/product.api';
import { buildCategoryTree } from '@/features/categories/utils/category.utils';
import ProductListPage from '@/features/products/pages/ProductListPage';
import LoadingSkeleton from '@/shared/components/LoadingSkeleton';
import { requireApiArray, requireApiObject } from '@/shared/services/responseContract';

export const metadata = {
  description: 'Khám phá tất cả các thiết kế thời trang đường phố cao cấp mới nhất từ Gritmode®.',
  openGraph: {
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
      const res = await getCategoriesApi();
      return buildCategoryTree(requireApiArray(res, 'Danh mục sản phẩm'));
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
      const res = await getProductsApi(params);
      const raw = requireApiObject(res, 'Danh sách sản phẩm');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Danh sách sản phẩm không hợp lệ');
      return raw;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div className="max-w-[1400px] mx-auto p-8"><LoadingSkeleton height="h-96" /></div>}>
        <ProductListPage />
      </Suspense>
    </HydrationBoundary>
  );
}
