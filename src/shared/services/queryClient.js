/**
 * React Query client configuration for Gritmode
 * Optimized for Next.js App Router (SSR + Client Hydration)
 */
import { isServer, QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60,   // 1 hour
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client per request to avoid data leaking across requests
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// Singleton reference for browser-side imports
export const queryClient = typeof window !== 'undefined' ? getQueryClient() : makeQueryClient();

const PUBLIC_QUERY_KEYS = new Set([
  'products',
  'product-detail',
  'categories-public-tree',
  'category-detail',
  'collections-public-list',
  'collection-detail',
]);

export const clearPrivateQueryCache = () => {
  const client = getQueryClient();
  return client.removeQueries({
    predicate: ({ queryKey }) => !PUBLIC_QUERY_KEYS.has(queryKey[0]),
  });
};
