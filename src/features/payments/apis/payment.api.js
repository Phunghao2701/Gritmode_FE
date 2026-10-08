/**
 * Payment API Endpoints
 * Communicates with /api/v1/payments and /api/v1/orders/:orderId/payment
 */
import api from '../../../shared/services/api';

/**
 * Lấy thông tin thanh toán hiện tại của đơn hàng (Polling payOS status)
 * @param {number|string} orderId
 */
export const getOrderPaymentApi = (orderId, guestInfo = {}, detailToken) => {
  const headers = {};
  if (guestInfo.email) headers['X-Guest-Email'] = guestInfo.email;
  if (guestInfo.phone) headers['X-Guest-Phone'] = guestInfo.phone;
  if (detailToken) headers['X-Order-Detail-Token'] = detailToken;

  return api.get(`/orders/${orderId}/payment`, {
    headers: Object.keys(headers).length ? headers : undefined,
  });
};

/**
 * Tạo mới / Tạo lại link thanh toán payOS cho đơn hàng
 * @param {object|number} data - { order_id } or orderId number
 */
export const createPayOSPaymentApi = (data, guestInfo = {}) => {
  const orderId = typeof data === 'object' ? data.order_id || data.orderId : data;
  const headers = {};
  if (guestInfo.email) headers['X-Guest-Email'] = guestInfo.email;
  if (guestInfo.phone) headers['X-Guest-Phone'] = guestInfo.phone;
  return api.post(
    '/payments/payos',
    { order_id: Number(orderId) },
    { headers: Object.keys(headers).length ? headers : undefined },
  );
};

/**
 * Hủy link thanh toán payOS đang chờ xử lý
 * @param {number|string} orderId
 */
export const cancelPayOSPaymentApi = (orderId) => {
  return api.post(`/orders/${orderId}/payment/cancel`);
};
