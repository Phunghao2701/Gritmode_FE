import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';
import { CACHE_STALE_TIME } from '../../../shared/services/cachePolicy';
import { requireApiObject } from '../../../shared/services/responseContract';

export const STOREFRONT_BANNERS_KEY = ['banners', 'active'];

export const getActiveBannersApi = async () => {
  const res = await api.get('/banners/active');
  const data = requireApiObject(res, 'Banner trang chủ');
  if (!Array.isArray(data.slides)) throw new Error('Banner trang chủ không hợp lệ');
  return {
    settings: data.settings ?? null,
    slides: data.slides.filter((s) => s.is_active !== false),
  };
};

export const useBanners = () => {
  return useQuery({
    queryKey: STOREFRONT_BANNERS_KEY,
    queryFn: getActiveBannersApi,
    staleTime: CACHE_STALE_TIME.banners,
    refetchOnWindowFocus: true,
  });
};
