/**
 * Order API Endpoints
 * Communicates with /api/v1/orders
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Lấy danh sách đơn hàng của người dùng hiện tại (Authenticated)
 * @param {object} params - { page, limit, status_order }
 */
export const getMyOrdersApi = (params = {}) => {
  return api.get('/orders', { params });
};

/**
 * Lấy chi tiết đơn hàng theo ID (Authenticated)
 * @param {number|string} orderId
 */
export const getMyOrderByIdApi = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

/**
 * Hủy đơn hàng của người dùng hiện tại (Authenticated)
 * @param {number|string} orderId
 */
export const cancelMyOrderApi = (orderId) => {
  return api.patch(`/orders/${orderId}/cancel`);
};

/**
 * Tra cứu đơn hàng của khách vãng lai (Guest)
 * @param {object} data - { order_code, email, phone }
 */
export const lookupGuestOrderApi = (data) => {
  return publicApi.post('/orders/guest/lookup', data);
};

/**
 * Hủy đơn hàng của khách vãng lai (Guest)
 * @param {string} orderCode
 * @param {object} data - { email, phone }
 */
export const cancelGuestOrderApi = (orderCode, data) => {
  return publicApi.post(`/orders/guest/${orderCode}/cancel`, data);
};
