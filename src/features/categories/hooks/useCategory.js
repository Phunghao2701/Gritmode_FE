/**
 * useCategory & useCategories Hooks
 * Handles public category tree fetching, selection, and flattening with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getCategoriesApi, getCategoryByIdApi } from '../apis/category.api';
import { buildCategoryTree, flattenCategoryTree } from '../utils/category.utils';
import { CACHE_STALE_TIME } from '../../../shared/services/cachePolicy';
import { requireApiArray, requireApiObject } from '../../../shared/services/responseContract';

export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories-public-tree'],
    queryFn: async () => {
      const res = await getCategoriesApi();
      const rawList = requireApiArray(res, 'Danh mục');
      // Build and sort hierarchical tree
      return buildCategoryTree(rawList);
    },
    staleTime: CACHE_STALE_TIME.categories,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  const categoryTree = query.data || [];
  const flatCategories = flattenCategoryTree(categoryTree);

  return {
    ...query,
    categoryTree,
    categories: flatCategories,
    isLoadingCategories: query.isLoading,
  };
};

export const useCategoryDetail = (categoryId) => {
  return useQuery({
    queryKey: ['category-detail', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const res = await getCategoryByIdApi(categoryId);
      return requireApiObject(res, 'Chi tiết danh mục');
    },
    enabled: !!categoryId,
    staleTime: CACHE_STALE_TIME.categories,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
};
