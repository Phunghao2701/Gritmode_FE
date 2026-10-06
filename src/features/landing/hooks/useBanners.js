import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/services/api';

export const STOREFRONT_BANNERS_KEY = ['banners', 'active'];

export const getActiveBannersApi = async () => {
  try {
    const res = await api.get('/banners/active');
    const data = res.data?.data || res.data;
    if (data && typeof data === 'object') {
      const rawSlides = Array.isArray(data.slides) ? data.slides : [];
      return {
        settings: data.settings || {},
        slides: rawSlides.filter((s) => s.is_active !== false),
      };
    }
    return { settings: {}, slides: [] };
  } catch (err) {
    try {
      const fallbackRes = await api.get('/banners');
      const data = fallbackRes.data?.data || fallbackRes.data;
      if (data && typeof data === 'object') {
        const rawSlides = Array.isArray(data.slides) ? data.slides : [];
        return {
          settings: data.settings || {},
          slides: rawSlides.filter((s) => s.is_active !== false),
        };
      }
    } catch {}
    return { settings: {}, slides: [] };
  }
};

export const useBanners = () => {
  return useQuery({
    queryKey: STOREFRONT_BANNERS_KEY,
    queryFn: getActiveBannersApi,
    staleTime: 1000 * 5, // 5 seconds fresh
    refetchOnWindowFocus: true,
  });
};
