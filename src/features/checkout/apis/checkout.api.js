/**
 * Checkout & Orders API Endpoints
 * Communicates with /api/v1/orders
 */
import api, { publicApi } from '../../../shared/services/api';

/**
 * Tạo đơn hàng từ giỏ hàng hiện tại (hỗ trợ cả Authenticated và Guest)
 * @param {object} orderData
 */
export const createOrderApi = (orderData) => {
  return api.post('/orders', orderData);
};

/**
 * Lấy danh sách đơn hàng của người dùng hiện tại (Authenticated)
 * @param {object} params
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
 * Hủy đơn hàng (Authenticated)
 * @param {number|string} orderId
 */
export const cancelMyOrderApi = (orderId) => {
  return api.patch(`/orders/${orderId}/cancel`);
};

/**
 * Khách vãng lai tra cứu đơn hàng (Guest)
 * @param {object} data - { order_code, email, phone }
 */
export const lookupGuestOrderApi = (data) => {
  return publicApi.post('/orders/guest/lookup', data);
};

/**
 * Khách vãng lai hủy đơn hàng (Guest)
 * @param {string} orderCode
 * @param {object} data - { email, phone }
 */
export const cancelGuestOrderApi = (orderCode, data) => {
  return publicApi.post(`/orders/guest/${orderCode}/cancel`, data);
};

/**
 * Lấy thông tin thanh toán của đơn hàng (Polling payOS status)
 * @param {number|string} orderId
 */
export const getOrderPaymentApi = (orderId) => {
  return api.get(`/orders/${orderId}/payment`);
};

/**
 * Hủy link thanh toán payOS
 * @param {number|string} orderId
 */
export const cancelPayOSPaymentApi = (orderId) => {
  return api.post(`/orders/${orderId}/payment/cancel`);
};
