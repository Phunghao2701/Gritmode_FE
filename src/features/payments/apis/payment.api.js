/**
 * Payment API Endpoints
 * Communicates with /api/v1/payments and /api/v1/orders/:orderId/payment
 */
import api from '../../../shared/services/api';

/**
 * Lấy thông tin thanh toán hiện tại của đơn hàng (Polling payOS status)
 * @param {number|string} orderId
 */
export const getOrderPaymentApi = (orderId) => {
  return api.get(`/orders/${orderId}/payment`);
};

/**
 * Tạo mới / Tạo lại link thanh toán payOS cho đơn hàng
 * @param {object|number} data - { order_id } or orderId number
 */
export const createPayOSPaymentApi = (data) => {
  const orderId = typeof data === 'object' ? data.order_id || data.orderId : data;
  return api.post('/payments/payos', { order_id: Number(orderId) });
};

/**
 * Hủy link thanh toán payOS đang chờ xử lý
 * @param {number|string} orderId
 */
export const cancelPayOSPaymentApi = (orderId) => {
  return api.post(`/orders/${orderId}/payment/cancel`);
};
