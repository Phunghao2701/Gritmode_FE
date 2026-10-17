/**
 * useCollection & useCollections Hooks
 * Handles public collection list and detail fetching with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getCollectionsApi, getCollectionByIdApi } from '../apis/collection.api';
import { sortCollectionsByPosition } from '../utils/collection.utils';
import { CACHE_STALE_TIME } from '../../../shared/services/cachePolicy';
import { requireApiArray, requireApiObject } from '../../../shared/services/responseContract';

export const useCollections = (options = {}) => {
  const { enabled = true, ...queryOptions } = options;

  const query = useQuery({
    queryKey: ['collections-public-list'],
    queryFn: async () => {
      const res = await getCollectionsApi();
      const rawList = requireApiArray(res, 'Bộ sưu tập');
      return sortCollectionsByPosition(rawList);
    },
    staleTime: CACHE_STALE_TIME.collections,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    ...queryOptions,
  });

  return {
    ...query,
    collections: query.data || [],
    isLoadingCollections: query.isLoading,
  };
};

export const useCollectionDetail = (collectionId) => {
  return useQuery({
    queryKey: ['collection-detail', collectionId],
    queryFn: async () => {
      if (!collectionId) return null;
      const res = await getCollectionByIdApi(collectionId);
      return requireApiObject(res, 'Chi tiết bộ sưu tập');
    },
    enabled: !!collectionId,
    staleTime: CACHE_STALE_TIME.collections,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
};
