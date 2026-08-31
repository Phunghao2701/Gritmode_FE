/**
 * Voucher Public & Admin API Endpoints
 * Communicates with /api/v1/vouchers/validate and /api/v1/admin/vouchers
 */
import api from '../../../shared/services/api';
import { normalizeVoucherCode } from '../utils/voucher.utils';

/**
 * Kiểm tra và xem trước mức giảm giá của Voucher cho giỏ hàng hiện tại (Public - Guest & User)
 * @param {string} codeVoucher
 */
export const validateVoucherApi = (codeVoucher) => {
  return api.post('/vouchers/validate', {
    code_voucher: normalizeVoucherCode(codeVoucher),
  });
};

/**
 * Lấy danh sách Voucher cho Admin (Admin)
 * @param {object} params
 */
export const getAdminVouchersApi = (params = {}) => {
  return api.get('/admin/vouchers', { params });
};

/**
 * Lấy chi tiết Voucher cho Admin (Admin)
 * @param {number|string} voucherId
 */
export const getAdminVoucherByIdApi = (voucherId) => {
  return api.get(`/admin/vouchers/${voucherId}`);
};

/**
 * Tạo mới Voucher (Admin)
 * @param {object} data
 */
export const createVoucherApi = (data) => {
  return api.post('/admin/vouchers', data);
};

/**
 * Cập nhật Voucher (Admin)
 * @param {number|string} voucherId
 * @param {object} data
 */
export const updateVoucherApi = (voucherId, data) => {
  return api.patch(`/admin/vouchers/${voucherId}`, data);
};

/**
 * Bật / tắt trạng thái hoạt động của Voucher (Admin)
 * @param {number|string} voucherId
 * @param {boolean} isActive
 */
export const updateVoucherStatusApi = (voucherId, isActive) => {
  return api.patch(`/admin/vouchers/${voucherId}/status`, { is_active: isActive });
};

/**
 * Xóa Voucher (Admin)
 * @param {number|string} voucherId
 */
export const deleteVoucherApi = (voucherId) => {
  return api.delete(`/admin/vouchers/${voucherId}`);
};
