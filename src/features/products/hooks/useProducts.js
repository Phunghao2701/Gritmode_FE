/**
 * useProducts Hook
 * Handles product listing, filtering, pagination, and caching with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getProductsApi } from '../apis/product.api';
export { useCategories, useCategoryDetail } from '../../categories/hooks/useCategory';
export { useCollections, useCollectionDetail } from '../../collections/hooks/useCollection';

export const useProducts = (params = {}) => {
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
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
          page: Number(params.page) || 1,
          limit: Number(params.limit) || 20,
          total: raw?.items?.length || 0,
          total_pages: 1,
        },
      };
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const items = query.data?.items || [];
  const pagination = query.data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
  };

  return {
    ...query,
    products: items,
    pagination,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.total_pages,
    isLoadingProducts: query.isLoading,
  };
};
