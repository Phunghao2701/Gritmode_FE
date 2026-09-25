/**
 * Checkout API Endpoints
 * Communicates with /api/v1/orders
 */
import api from '../../../shared/services/api';

/**
 * Tạo đơn hàng từ giỏ hàng hiện tại (hỗ trợ cả Authenticated và Guest)
 * @param {object} orderData
 */
export const createOrderApi = (orderData) => {
  return api.post('/orders', orderData);
};

