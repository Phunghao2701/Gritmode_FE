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
 * Lấy chi tiết đơn hàng từ signed link trong email (Guest)
 * @param {number|string} orderId
 * @param {string} token
 */
export const getSharedOrderByIdApi = (orderId, token) => {
  return publicApi.get(`/orders/shared/${orderId}`, {
    params: { token },
  });
};

/**
 * Tạo signed link tới chi tiết đơn hàng sau khi xác thực quyền truy cập
 * @param {number|string} orderId
 * @param {{email?: string, phone?: string}} guestInfo
 */
export const createOrderDetailLinkApi = (orderId, guestInfo = {}) => {
  const headers = {};
  if (guestInfo.email) headers['X-Guest-Email'] = guestInfo.email;
  if (guestInfo.phone) headers['X-Guest-Phone'] = guestInfo.phone;

  return api.post(`/orders/${orderId}/detail-link`, null, {
    headers: Object.keys(headers).length ? headers : undefined,
  });
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
