/**
 * useCollection & useCollections Hooks
 * Handles public collection list and detail fetching with TanStack Query.
 */
import { useQuery } from '@tanstack/react-query';
import { getCollectionsApi, getCollectionByIdApi } from '../apis/collection.api';
import { sortCollectionsByPosition } from '../utils/collection.utils';

export const useCollections = () => {
  const query = useQuery({
    queryKey: ['collections-public-list'],
    queryFn: async () => {
      const res = await getCollectionsApi();
      const data = res.data?.data || res.data || [];
      const rawList = Array.isArray(data) ? data : [];
      return sortCollectionsByPosition(rawList);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnMount: 'always',
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
      return res.data?.data || res.data;
    },
    enabled: !!collectionId,
    staleTime: 1000 * 60 * 5,
  });
};
