import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/services/queryClient';
import { getProductDetailApi } from '@/features/products/apis/product.api';
import ProductDetailPage from '@/features/products/pages/ProductDetailPage';

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProductDetailApi(id);
    const product = res.data?.data || res.data;
    if (product) {
      const title = product.name_product || product.name || 'Sản phẩm Gritmode';
      const description = product.description_product || product.description || 'Thời trang đường phố cao cấp Gritmode®';
      const image = product.thumbnail || product.images?.[0]?.url_product_image || 'https://res.cloudinary.com/placeholder.jpg';

      return {
        title: `${title} | Gritmode®`,
        description,
        openGraph: {
          title: `${title} | Gritmode®`,
          description,
          images: [{ url: image }],
        },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: 'Chi tiết sản phẩm | Gritmode®',
    description: 'Thời trang thể thao & phong cách đường phố cao cấp Gritmode®.',
  };
}

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
