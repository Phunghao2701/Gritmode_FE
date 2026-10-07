/**
 * useProducts Hook
 * Handles product listing, filtering, pagination, and caching with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getProductsApi } from '../apis/product.api';
import { CACHE_STALE_TIME } from '../../../shared/services/cachePolicy';
import { requireApiObject } from '../../../shared/services/responseContract';
export { useCategories, useCategoryDetail } from '../../categories/hooks/useCategory';
export { useCollections, useCollectionDetail } from '../../collections/hooks/useCollection';

export const useProducts = (params = {}, options = {}) => {
  const { enabled = true, ...restOptions } = options;
  const query = useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const res = await getProductsApi(params);
      const raw = requireApiObject(res, 'Danh sách sản phẩm');
      if (!Array.isArray(raw.items) || !raw.pagination) throw new Error('Danh sách sản phẩm không hợp lệ');
      return raw;
    },
    enabled,
    staleTime: CACHE_STALE_TIME.products,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...restOptions,
  });

  const items = query.data?.items ?? [];
  const pagination = query.data?.pagination ?? null;

  return {
    ...query,
    products: items,
    items,
    pagination,
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? 0,
    totalPages: pagination?.total_pages ?? 0,
    isLoadingProducts: query.isLoading,
  };
};
