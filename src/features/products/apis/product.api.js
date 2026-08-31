/**
 * Product & Catalog API Endpoints for Gritmode
 * Communicates with /api/v1/products, /api/v1/categories, /api/v1/collections, and /api/v1/admin/products
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Lấy danh sách sản phẩm (public)
 * @param {object} params
 */
export const getProductsApi = (params = {}) => {
  const query = { ...params };
  if (params.categoryId !== undefined) {
    query.category_id = params.categoryId;
    delete query.categoryId;
  }
  if (params.collectionId !== undefined) {
    query.collection_id = params.collectionId;
    delete query.collectionId;
  }
  if (params.minPrice !== undefined) {
    query.min_price = params.minPrice;
    delete query.minPrice;
  }
  if (params.maxPrice !== undefined) {
    query.max_price = params.maxPrice;
    delete query.maxPrice;
  }

  return publicApi.get('/products', { params: query });
};

/**
 * Lấy chi tiết sản phẩm cùng hình ảnh, options, variants và inventory (public)
 * @param {number|string} productId
 */
export const getProductDetailApi = (productId) => {
  return publicApi.get(`/products/${productId}`);
};

/**
 * Lấy danh sách danh mục sản phẩm (public)
 */
export const getCategoriesApi = () => {
  return publicApi.get('/categories');
};

/**
 * Lấy danh sách bộ sưu tập (public)
 */
export const getCollectionsApi = () => {
  return publicApi.get('/collections');
};

/**
 * Tạo mới sản phẩm (Admin)
 * @param {object} data
 */
export const createProductApi = (data) => {
  return api.post('/admin/products', data);
};

/**
 * Cập nhật sản phẩm (Admin)
 * @param {number|string} id
 * @param {object} data
 */
export const updateProductApi = (id, data) => {
  return api.patch(`/admin/products/${id}`, data);
};

/**
 * Xóa sản phẩm (Admin)
 * @param {number|string} id
 */
export const deleteProductApi = (id) => {
  return api.delete(`/admin/products/${id}`);
};
