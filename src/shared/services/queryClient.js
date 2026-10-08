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
        refetchOnReconnect: true,
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

export const PUBLIC_QUERY_KEYS = new Set([
  'products',
  'product-detail',
  'categories-public-tree',
  'category-detail',
  'collections-public-list',
  'collection-detail',
  'banners',
]);

export const clearPrivateQueryCache = () => {
  return queryClient.removeQueries({
    predicate: ({ queryKey }) => !PUBLIC_QUERY_KEYS.has(queryKey[0]),
  });
};

const CACHE_SYNC_CHANNEL = 'gritmode:query-invalidation';
const CACHE_SYNC_STORAGE_KEY = 'gritmode:query-invalidation:event';
let cacheSyncChannel = null;
let cacheSyncSubscribers = 0;

const isBrowser = () => typeof window !== 'undefined';

const getCacheSyncChannel = () => {
  if (!isBrowser() || typeof window.BroadcastChannel !== 'function') return null;
  if (!cacheSyncChannel) {
    cacheSyncChannel = new window.BroadcastChannel(CACHE_SYNC_CHANNEL);
  }
  return cacheSyncChannel;
};

const createCacheSyncEvent = (queryKeys) => ({
  id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`,
  queryKeys,
  timestamp: Date.now(),
});

const readQueryKeys = (payload) => {
  if (!payload || !Array.isArray(payload.queryKeys)) return [];
  return payload.queryKeys.filter((queryKey) => (
    Array.isArray(queryKey) && queryKey.length > 0 && typeof queryKey[0] === 'string'
  ));
};

/**
 * Tell other tabs that a mutation changed data represented by these query keys.
 * BroadcastChannel is preferred; localStorage is kept as a compatibility
 * fallback for browsers where BroadcastChannel is unavailable.
 */
export const broadcastQueryInvalidation = (queryKeys) => {
  if (!isBrowser() || !Array.isArray(queryKeys) || queryKeys.length === 0) return;

  const message = createCacheSyncEvent(queryKeys);
  const channel = getCacheSyncChannel();
  if (channel) {
    channel.postMessage(message);
    return;
  }

  try {
    window.localStorage.setItem(CACHE_SYNC_STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Local invalidation in the source tab remains authoritative.
  }
};

/** Subscribe to cache invalidation messages from other tabs. */
export const subscribeToQueryInvalidation = (onInvalidate) => {
  if (!isBrowser() || typeof onInvalidate !== 'function') return () => {};

  const handleMessage = (event) => {
    readQueryKeys(event.data).forEach(onInvalidate);
  };

  const handleStorage = (event) => {
    if (event.key !== CACHE_SYNC_STORAGE_KEY || !event.newValue) return;
    try {
      readQueryKeys(JSON.parse(event.newValue)).forEach(onInvalidate);
    } catch {
      // Ignore malformed or unavailable cross-tab payloads.
    }
  };

  const channel = getCacheSyncChannel();

  if (channel) {
    channel.addEventListener('message', handleMessage);
    cacheSyncSubscribers += 1;
  } else {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
      cacheSyncSubscribers = Math.max(0, cacheSyncSubscribers - 1);
      if (cacheSyncSubscribers === 0 && cacheSyncChannel === channel) {
        channel.close();
        cacheSyncChannel = null;
      }
    }
    window.removeEventListener('storage', handleStorage);
  };
};
