import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminHeroApi,
  updateHeroContentApi,
  addHeroImageApi,
  toggleImageStatusApi,
  deleteHeroImageApi,
} from '../apis/adminBannerApi';
import { toast } from '../../../shared/utils/toast';

export const ADMIN_HERO_QUERY_KEY = ['admin-hero-banner'];
export const STOREFRONT_HERO_QUERY_KEY = ['banners', 'active'];

export const useAdminHero = () => {
  return useQuery({
    queryKey: ADMIN_HERO_QUERY_KEY,
    queryFn: getAdminHeroApi,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};

export const useUpdateHeroContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHeroContentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HERO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STOREFRONT_HERO_QUERY_KEY });
      toast.success('Cập nhật nội dung Hero thành công');
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Lỗi khi cập nhật nội dung';
      toast.error(message);
    },
  });
};

export const useAddHeroImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addHeroImageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HERO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STOREFRONT_HERO_QUERY_KEY });
      toast.success('Đã tải ảnh lên bộ sưu tập Hero');
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Lỗi khi thêm ảnh slide';
      toast.error(message);
    },
  });
};

export const useToggleImageStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleImageStatusApi,
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_HERO_QUERY_KEY });
      const previousData = queryClient.getQueryData(ADMIN_HERO_QUERY_KEY);

      queryClient.setQueryData(ADMIN_HERO_QUERY_KEY, (old) => {
        if (!old || !Array.isArray(old.slides)) return old;
        return {
          ...old,
          slides: old.slides.map((s) =>
            s.banner_id === id ? { ...s, is_active } : s
          ),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(ADMIN_HERO_QUERY_KEY, context.previousData);
      }
      const message = err.response?.data?.message || err.message || 'Lỗi đổi trạng thái ảnh';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HERO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STOREFRONT_HERO_QUERY_KEY });
    },
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái ảnh');
    },
  });
};

export const useDeleteHeroImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHeroImageApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_HERO_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: STOREFRONT_HERO_QUERY_KEY });
      toast.success('Đã xóa ảnh slide');
    },
    onError: (err) => {
      const message = err.response?.data?.message || err.message || 'Lỗi khi xóa ảnh';
      toast.error(message);
    },
  });
};
