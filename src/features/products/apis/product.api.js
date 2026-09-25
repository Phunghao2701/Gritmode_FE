/**
 * Product & Catalog API Endpoints for Gritmode
 * Communicates with /api/v1/products, /api/v1/categories, /api/v1/collections, and /api/v1/admin/products
 */
import { publicApi } from '../../../shared/services/api';

/**
 * Lấy danh sách sản phẩm (public)
 * @param {object} params
 */
export const getProductsApi = (params = {}) => {
  const query = { ...params };
  if (params.categorySlug !== undefined) {
    query.category = params.categorySlug;
    delete query.categorySlug;
  }
  if (params.collectionSlug !== undefined) {
    query.collection = params.collectionSlug;
    delete query.collectionSlug;
  }
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

