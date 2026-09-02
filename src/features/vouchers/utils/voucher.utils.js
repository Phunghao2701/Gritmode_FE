/**
 * Voucher Domain Utilities
 * Provides formatting, input normalization, and timeframe checking helpers.
 */
import { formatPriceVND } from '../../products/utils/product.utils';

/**
 * Normalizes user input voucher code
 * @param {string} code
 * @returns {string}
 */
export const normalizeVoucherCode = (code = '') => {
  return String(code).trim().toUpperCase();
};

/**
 * Formats voucher discount label for UI display
 * @param {object} voucher
 * @returns {string}
 */
export const formatVoucherDiscount = (voucher) => {
  if (!voucher) return '';

  const discountType = voucher.discount_type;
  const discountVal = Number(voucher.discount_value || 0);
  const maxDiscount = voucher.maximum_discount_amount ? Number(voucher.maximum_discount_amount) : null;
  const minOrder = voucher.minimum_order_amount ? Number(voucher.minimum_order_amount) : null;

  let label = '';
  if (discountType === 'percentage') {
    label = `Giảm ${discountVal}%`;
    if (maxDiscount) {
      label += ` (Tối đa ${formatPriceVND(maxDiscount)})`;
    }
  } else {
    label = `Giảm ${formatPriceVND(discountVal)}`;
  }

  if (minOrder && minOrder > 0) {
    label += ` cho đơn từ ${formatPriceVND(minOrder)}`;
  }

  return label;
};

