import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getProductDetailApi } from '@/features/products/apis/product.api';
import ProductDetailPage from '@/features/products/pages/ProductDetailPage';

export const revalidate = 60;

export default async function ProductPage({ params }) {
  const { id } = await params;
  const queryClient = getQueryClient();

  // Prefetch product details on server
  await queryClient.prefetchQuery({
    queryKey: ['product-detail', id],
    queryFn: async () => {
      try {
        const res = await getProductDetailApi(id);
        return res.data?.data || res.data;
      } catch {
        return null;
      }
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailPage />
    </HydrationBoundary>
  );
}
