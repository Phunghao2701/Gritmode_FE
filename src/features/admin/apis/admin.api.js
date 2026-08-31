/**
 * Admin API Endpoints for Gritmode
 * Fully integrated with Gritmode_BE
 */
import api, { publicApi } from '../../../shared/services/api';

// 1. Dashboard Stats
export const getAdminStatsApi = () => {
  return api.get('/admin/dashboard/stats');
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
  return publicApi.get('/products', { params });
};

export const getAdminProductByIdApi = (productId) => {
  return publicApi.get(`/products/${productId}`);
};

export const createAdminProductApi = (data) => {
  return api.post('/admin/products', data);
};

export const updateAdminProductApi = (productId, data) => {
  return api.patch(`/admin/products/${productId}`, data);
};

export const deleteAdminProductApi = (productId) => {
  return api.delete(`/admin/products/${productId}`);
};

export const createProductOptionApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/options`, data);
};

export const createOptionValueApi = (optionId, data) => {
  return api.post(`/admin/product-options/${optionId}/values`, data);
};

export const createProductVariantApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/variants`, data);
};

export const createProductImageApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/images`, data);
};

export const assignProductCategoryApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/categories`, data);
};

export const assignProductCollectionApi = (productId, data) => {
  return api.post(`/admin/products/${productId}/collections`, data);
};

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
  return publicApi.get('/categories');
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

// 7. Audit Logs
export const getAdminAuditLogsApi = (params = {}) => {
  return api.get('/admin/audit-logs', { params });
};

export const getAdminAuditLogByIdApi = (auditLogId) => {
  return api.get(`/admin/audit-logs/${auditLogId}`);
};
