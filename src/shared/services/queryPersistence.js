import { dehydrate, hydrate } from '@tanstack/react-query';

// Public catalog data may be reused between visits, but it is always revalidated by React Query.
const DB_NAME = 'gritmode-query-cache';
const DB_VERSION = 1;
const STORE_NAME = 'persisted-client';
const RECORD_KEY = 'public-query-cache';

export const PUBLIC_QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7;
export const PUBLIC_QUERY_CACHE_BUSTER = 'gritmode-public-query-cache-v3';

// Only low-volatility public content is safe to restore between visits.
// Products stay network-backed because their price and inventory can change at any time.
const PERSISTED_QUERY_KEYS = new Set([
  'categories-public-tree',
  'category-detail',
  'collections-public-list',
  'collection-detail',
  'banners',
]);

const isBrowser = () => typeof window !== 'undefined' && Boolean(window.indexedDB);

const shouldPersistQuery = (query) => (
  query?.state?.status === 'success'
    && PERSISTED_QUERY_KEYS.has(query.queryKey?.[0])
);

const openDatabase = () => new Promise((resolve, reject) => {
  if (!isBrowser()) {
    resolve(null);
    return;
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'key' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Không thể mở IndexedDB cache'));
});

const readRecord = async () => {
  const database = await openDatabase();
  if (!database) return null;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Không thể đọc IndexedDB cache'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
};

const writeRecord = async (record) => {
  const database = await openDatabase();
  if (!database) return;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Không thể ghi IndexedDB cache'));
    };
  });
};

const removeRecord = async () => {
  const database = await openDatabase();
  if (!database) return;

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(RECORD_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('Không thể xóa IndexedDB cache'));
    };
  });
};

export const restorePersistedQueryCache = async (queryClient) => {
  if (!isBrowser()) return false;

  try {
    const record = await readRecord();
    const isExpired = !record || (
      Date.now() - Number(record.timestamp || 0) > PUBLIC_QUERY_CACHE_MAX_AGE
    );

    if (
      isExpired
      || record.version !== DB_VERSION
      || record.buster !== PUBLIC_QUERY_CACHE_BUSTER
      || !record.clientState
    ) {
      if (record) await removeRecord();
      return false;
    }

    hydrate(queryClient, record.clientState);
    return true;
  } catch {
    // Persistent cache is an optimization. A storage failure must not block
    // the normal API-backed application flow.
    return false;
  }
};

export const subscribeToPersistedQueryCache = (queryClient) => {
  if (!isBrowser()) return () => {};

  let timer = null;
  let isWriting = false;
  let writeAgain = false;

  const persist = async () => {
    if (isWriting) {
      writeAgain = true;
      return;
    }

    isWriting = true;
    try {
      await writeRecord({
        key: RECORD_KEY,
        version: DB_VERSION,
        buster: PUBLIC_QUERY_CACHE_BUSTER,
        timestamp: Date.now(),
        clientState: dehydrate(queryClient, {
          shouldDehydrateQuery: shouldPersistQuery,
        }),
      });
    } catch {
      // Continue using the network source of truth when IndexedDB is full or unavailable.
    } finally {
      isWriting = false;
      if (writeAgain) {
        writeAgain = false;
        persist();
      }
    }
  };

    const schedulePersist = (event) => {
      if (!event?.query || !shouldPersistQuery(event.query)) return;
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      persist();
    }, 1000);
  };

  const unsubscribe = queryClient.getQueryCache().subscribe(schedulePersist);

  return () => {
    if (timer) window.clearTimeout(timer);
    unsubscribe();
  };
};
