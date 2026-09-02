/**
 * useCategory & useCategories Hooks
 * Handles public category tree fetching, selection, and flattening with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getCategoriesApi, getCategoryByIdApi } from '../apis/category.api';
import { buildCategoryTree, flattenCategoryTree } from '../utils/category.utils';

export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories-public-tree'],
    queryFn: async () => {
      const res = await getCategoriesApi();
      const data = res.data?.data || res.data || [];
      const rawList = Array.isArray(data) ? data : [];
      // Build and sort hierarchical tree
      return buildCategoryTree(rawList);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnMount: 'always',
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
      return res.data?.data || res.data;
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  });
};
