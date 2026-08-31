/**
 * React Query client configuration for Gritmode
 */
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      gcTime: 1000 * 60 * 60 * 24,  // 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: 'gritmode-rq-cache',
});

export const isAdminQuery = (query) => {
  const rootKey = query.queryKey?.[0];
  return typeof rootKey === 'string' && rootKey.startsWith('admin');
};

export const shouldPersistQuery = (query) => (
  defaultShouldDehydrateQuery(query) && !isAdminQuery(query)
);

export const clearQueryCache = async () => {
  queryClient.clear();
  await localStoragePersister.removeClient();
};
