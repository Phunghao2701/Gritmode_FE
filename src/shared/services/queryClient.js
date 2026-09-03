/**
 * React Query client configuration for Gritmode
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 60,       // 1 hour
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PUBLIC_QUERY_KEYS = new Set([
  'products',
  'product-detail',
  'categories-public-tree',
  'category-detail',
  'collections-public-list',
  'collection-detail',
]);

export const clearPrivateQueryCache = () => queryClient.removeQueries({
  predicate: ({ queryKey }) => !PUBLIC_QUERY_KEYS.has(queryKey[0]),
});
