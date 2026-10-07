import api from '../../../shared/services/api';
import { requireApiArray, requireApiObject } from '../../../shared/services/responseContract';

/**
 * Lấy toàn bộ cấu hình Hero & danh sách ảnh slide (Admin)
 */
export const getAdminHeroApi = async () => {
  const response = await api.get('/admin/banners');
  return requireApiObject(response, 'Cấu hình banner');
};

/**
 * Cập nhật nội dung chung của Hero: tiêu đề, mô tả, marquee, subtitle
 */
export const updateHeroContentApi = async (payload) => {
  const response = await api.put('/admin/banners/content', payload);
  return requireApiObject(response, 'Nội dung banner');
};

/**
 * Thêm ảnh slide mới vào Hero
 */
export const addHeroImageApi = async (payload) => {
  const response = await api.post('/admin/banners/images', payload);
  return requireApiObject(response, 'Ảnh banner');
};

/**
 * Bật / tắt trạng thái hiển thị của ảnh slide
 */
export const toggleImageStatusApi = async ({ id, is_active }) => {
  const response = await api.patch(`/admin/banners/images/${id}/status`, { is_active });
  return requireApiObject(response, 'Trạng thái ảnh banner');
};

/**
 * Xóa ảnh slide khỏi Hero
 */
export const deleteHeroImageApi = async (id) => {
  const response = await api.delete(`/admin/banners/images/${id}`);
  return requireApiObject(response, 'Ảnh banner');
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
  const uploaded = requireApiArray(response, 'Ảnh banner tải lên');
  if (!uploaded[0]) throw new Error('Upload banner không trả về ảnh');
  return uploaded[0];
};
