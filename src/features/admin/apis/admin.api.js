/**
 * Admin API Endpoints for Gritmode
 * Fully integrated with Gritmode_BE
 */
import api from '../../../shared/services/api';

// 1. Dashboard Stats & Overview
export const getAdminStatsApi = () => {
  return api.get('/admin/dashboard/stats');
};

export const getAdminDashboardOverviewApi = () => {
  return api.get('/admin/dashboard/overview');
};

// 2. Orders Lifecycle Management
export const getAdminOrdersApi = (params = {}) => {
  return api.get('/admin/orders', { params });
};

export const getAdminOrderByIdApi = (orderId) => {
  return api.get(`/admin/orders/${orderId}`);
};

export const confirmAdminOrderApi = (orderId) => {
  return api.patch(`/admin/orders/${orderId}/confirm`);
};

export const processAdminOrderApi = (orderId) => {
  return api.patch(`/admin/orders/${orderId}/processing`);
};

export const shipAdminOrderApi = (orderId) => {
  return api.patch(`/admin/orders/${orderId}/shipping`);
};

export const completeAdminOrderApi = (orderId) => {
  return api.patch(`/admin/orders/${orderId}/complete`);
};

export const cancelAdminOrderApi = (orderId, reason) => {
  return api.patch(`/admin/orders/${orderId}/cancel`, reason ? { reason } : {});
};

// 3. Products
export const getAdminProductsApi = (params = {}) => {
  return api.get('/admin/products', { params });
};

export const getAdminProductMetaApi = () => {
  return api.get('/admin/products/meta');
};

export const getAdminProductByIdApi = (productId) => {
  return api.get(`/admin/products/${productId}`);
};


export const createAdminFullProductApi = (data) => api.post('/admin/products/full', data);
export const updateAdminFullProductApi = (productId, data) => api.put(`/admin/products/${productId}/full`, data);

export const uploadAdminProductImagesApi = (files, onUploadProgress) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return api.post('/admin/uploads/product-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

export const updateAdminProductApi = (productId, data) => {
  return api.patch(`/admin/products/${productId}`, data);
};

export const deleteAdminProductApi = (productId) => {
  return api.delete(`/admin/products/${productId}`);
};

export const publishAdminProductApi = (productId) => api.patch(`/admin/products/${productId}/publish`);
export const archiveAdminProductApi = (productId) => api.patch(`/admin/products/${productId}/archive`);

export const createProductOptionApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/options`, data);
};

export const createOptionValueApi = (optionId, data) => {
  return api.post(`/admin/product-options/${optionId}/values`, data);
};
export const updateProductOptionApi = (optionId, data) => api.patch(`/admin/product-options/${optionId}`, data);
export const deleteProductOptionApi = (optionId) => api.delete(`/admin/product-options/${optionId}`);
export const updateOptionValueApi = (valueId, data) => api.patch(`/admin/product-option-values/${valueId}`, data);
export const deleteOptionValueApi = (valueId) => api.delete(`/admin/product-option-values/${valueId}`);

export const createProductVariantApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/variants`, data);
};
export const updateProductVariantApi = (variantId, data) => api.patch(`/admin/product-variants/${variantId}`, data);
export const deleteProductVariantApi = (variantId) => api.delete(`/admin/product-variants/${variantId}`);

export const createProductImageApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/images`, data);
};
export const deleteProductImageApi = (imageId) => api.delete(`/admin/product-images/${imageId}`);

export const assignProductCategoryApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/categories`, data);
};
export const removeProductCategoryApi = (productId, categoryId) => api.delete(`/admin/products/${productId}/categories/${categoryId}`);
export const setPrimaryProductCategoryApi = (productId, categoryId) => api.patch(`/admin/products/${productId}/categories/${categoryId}/primary`);

export const getAdminCollectionsApi = () => api.get('/admin/collections');
export const createAdminCollectionApi = (data) => api.post('/admin/collections', data);
export const assignProductCollectionApi = (collectionId, productId, position = 0) => api.post(`/admin/collections/${collectionId}/products`, { product_id: Number(productId), position_product_collection: Number(position) });
export const removeProductCollectionApi = (collectionId, productId) => api.delete(`/admin/collections/${collectionId}/products/${productId}`);

// 4. Inventory
export const getAdminInventoryApi = (params = {}) => {
  return api.get('/admin/inventory', { params });
};

export const getInventoryByVariantIdApi = (variantId) => {
  return api.get(`/admin/product-variants/${variantId}/inventory`);
};

export const updateVariantInventoryApi = (variantId, quantityStock) => {
  return api.patch(`/admin/product-variants/${variantId}/inventory`, {
    quantity_stock: Number(quantityStock),
  });
};

// 5. Categories & Collections
export const getAdminCategoriesApi = () => {
  return api.get('/admin/categories');
};

export const createCategoryApi = (data) => {
  return api.post('/admin/categories', data);
};

export const updateCategoryApi = (id, data) => {
  return api.put(`/admin/categories/${id}`, data);
};

export const deleteCategoryApi = (id) => {
  return api.delete(`/admin/categories/${id}`);
};

// 6. Users Management
export const getAdminUsersApi = (params = {}) => {
  return api.get('/admin/users', { params });
};

export const getAdminUserByIdApi = (userId) => {
  return api.get(`/admin/users/${userId}`);
};

export const blockAdminUserApi = (userId) => {
  return api.patch(`/admin/users/${userId}/block`);
};

export const unblockAdminUserApi = (userId) => {
  return api.patch(`/admin/users/${userId}/unblock`);
};

export const setAdminUserInactiveApi = (userId) => {
  return api.patch(`/admin/users/${userId}/inactive`);
};
