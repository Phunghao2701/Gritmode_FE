/**
 * Category Public & Admin API Endpoints
 * Communicates with /api/v1/categories and /api/v1/admin/categories
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Lấy cây danh mục sản phẩm (Public)
 */
export const getCategoriesApi = () => {
  return publicApi.get('/categories');
};

/**
 * Lấy chi tiết danh mục theo ID (Public)
 * @param {number|string} categoryId
 */
export const getCategoryByIdApi = (categoryId) => {
  return publicApi.get(`/categories/${categoryId}`);
};

/**
 * Lấy danh sách sản phẩm theo danh mục (Public)
 * @param {number|string} categoryId
 * @param {object} params
 */
export const getCategoryProductsApi = (categoryId, params = {}) => {
  return publicApi.get(`/categories/${categoryId}/products`, { params });
};

/**
 * Lấy toàn bộ danh mục cho Admin (Admin)
 * @param {object} params
 */
export const getAdminCategoriesApi = (params = {}) => {
  return api.get('/admin/categories', { params });
};

/**
 * Tạo mới danh mục (Admin)
 * @param {object} data
 */
export const createCategoryApi = (data) => {
  return api.post('/admin/categories', data);
};

/**
 * Cập nhật danh mục (Admin)
 * @param {number|string} categoryId
 * @param {object} data
 */
export const updateCategoryApi = (categoryId, data) => {
  return api.patch(`/admin/categories/${categoryId}`, data);
};

/**
 * Xóa danh mục (Admin)
 * @param {number|string} categoryId
 */
export const deleteCategoryApi = (categoryId) => {
  return api.delete(`/admin/categories/${categoryId}`);
};
