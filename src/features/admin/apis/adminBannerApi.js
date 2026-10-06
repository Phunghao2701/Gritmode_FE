import api from '../../../shared/services/api';

/**
 * Lấy toàn bộ cấu hình Hero & danh sách ảnh slide (Admin)
 */
export const getAdminHeroApi = async () => {
  const response = await api.get('/admin/banners');
  return response.data?.data || response.data || { settings: {}, slides: [] };
};

/**
 * Cập nhật nội dung chung của Hero: tiêu đề, mô tả, marquee, subtitle
 */
export const updateHeroContentApi = async (payload) => {
  const response = await api.put('/admin/banners/content', payload);
  return response.data?.data || response.data;
};

/**
 * Thêm ảnh slide mới vào Hero
 */
export const addHeroImageApi = async (payload) => {
  const response = await api.post('/admin/banners/images', payload);
  return response.data?.data || response.data;
};

/**
 * Bật / tắt trạng thái hiển thị của ảnh slide
 */
export const toggleImageStatusApi = async ({ id, is_active }) => {
  const response = await api.patch(`/admin/banners/images/${id}/status`, { is_active });
  return response.data?.data || response.data;
};

/**
 * Xóa ảnh slide khỏi Hero
 */
export const deleteHeroImageApi = async (id) => {
  const response = await api.delete(`/admin/banners/images/${id}`);
  return response.data?.data || response.data;
};

/**
 * Tải ảnh banner lên Cloudinary thông qua backend
 */
export const uploadBannerImageApi = async (file) => {
  const formData = new FormData();
  formData.append('images', file);
  const response = await api.post('/admin/uploads/product-images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  const uploaded = response.data?.data || response.data;
  return Array.isArray(uploaded) ? uploaded[0] : uploaded;
};
