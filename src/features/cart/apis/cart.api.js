/**
 * Cart API Endpoints
 * Communicates with /api/v1/cart and /api/v1/cart/items
 */
import api from '../../../shared/services/api';

/**
 * Lấy giỏ hàng hiện tại (hỗ trợ cả Authenticated và Guest qua X-Guest-Token)
 */
export const getCartApi = () => {
  return api.get('/cart');
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {object} data - { product_variant_id, quantity }
 */
export const addToCartApi = (data) => {
  const payload = {
    product_variant_id: Number(data.product_variant_id || data.variantId),
    quantity: Number(data.quantity || data.quantity_cart_item || 1),
  };
  return api.post('/cart/items', payload);
};

/**
 * Cập nhật số lượng của một cart item
 * @param {number|string} cartItemId
 * @param {object|number} data - { quantity } or number
 */
export const updateCartItemApi = (cartItemId, data) => {
  const quantity = typeof data === 'number' ? data : Number(data.quantity || data.quantity_cart_item || 1);
  return api.patch(`/cart/items/${cartItemId}`, { quantity });
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 * @param {number|string} cartItemId
 */
export const removeCartItemApi = (cartItemId) => {
  return api.delete(`/cart/items/${cartItemId}`);
};

/**
 * Xóa toàn bộ sản phẩm trong giỏ hàng
 */
export const clearCartApi = () => {
  return api.delete('/cart');
};
