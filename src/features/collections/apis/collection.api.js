/**
 * Collection Public & Admin API Endpoints
 * Communicates with /api/v1/collections and /api/v1/admin/collections
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Lấy danh sách bộ sưu tập đang hiển thị (Public)
 */
export const getCollectionsApi = () => {
  return publicApi.get('/collections');
};

/**
 * Lấy chi tiết bộ sưu tập theo ID (Public)
 * @param {number|string} collectionId
 */
export const getCollectionByIdApi = (collectionId) => {
  return publicApi.get(`/collections/${collectionId}`);
};

/**
 * Lấy danh sách sản phẩm trong bộ sưu tập (Public)
 * @param {number|string} collectionId
 * @param {object} params
 */
export const getCollectionProductsApi = (collectionId, params = {}) => {
  return publicApi.get(`/collections/${collectionId}/products`, { params });
};

/**
 * Lấy toàn bộ bộ sưu tập cho Admin (Admin)
 * @param {object} params
 */
export const getAdminCollectionsApi = (params = {}) => {
  return api.get('/admin/collections', { params });
};

/**
 * Tạo mới bộ sưu tập (Admin)
 * @param {object} data
 */
export const createCollectionApi = (data) => {
  return api.post('/admin/collections', data);
};

/**
 * Cập nhật bộ sưu tập (Admin)
 * @param {number|string} collectionId
 * @param {object} data
 */
export const updateCollectionApi = (collectionId, data) => {
  return api.patch(`/admin/collections/${collectionId}`, data);
};

/**
 * Xóa bộ sưu tập (Admin)
 * @param {number|string} collectionId
 */
export const deleteCollectionApi = (collectionId) => {
  return api.delete(`/admin/collections/${collectionId}`);
};
