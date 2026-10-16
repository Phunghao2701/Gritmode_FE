import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getProductDetailApi } from '@/features/products/apis/product.api';
import ProductDetailPage from '@/features/products/pages/ProductDetailPage';
import { requireApiObject } from '@/shared/services/responseContract';

// Product media and inventory are mutable admin data. Do not serve an ISR
// snapshot after an image crop has been saved.
export const revalidate = 0;

export default async function ProductPage({ params }) {
  const { id } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      const res = await getProductDetailApi(id);
      return requireApiObject(res, 'Chi tiết sản phẩm');
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailPage />
    </HydrationBoundary>
  );
}
