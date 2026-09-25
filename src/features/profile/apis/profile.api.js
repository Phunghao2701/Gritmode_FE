/**
 * Profile & Address API Endpoints for Gritmode
 * Communicates with /api/v1/users/me and /api/v1/users/me/addresses
 */
import api from '../../../shared/services/api';

/**
 * Lấy thông tin cá nhân của người dùng hiện tại
 */
export const getProfileApi = () => {
  return api.get('/users/me');
};

/**
 * Cập nhật thông tin cá nhân (PATCH)
 * @param {{ full_name?: string, phone?: string, url_image?: string, date_of_birth?: string, gender?: boolean }} data
 */
export const updateProfileApi = (data) => {
  // Lọc chỉ gửi các trường được phép cập nhật
  const payload = {};
  if (data.full_name !== undefined) payload.full_name = data.full_name;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.url_image !== undefined) payload.url_image = data.url_image;
  if (data.date_of_birth !== undefined) payload.date_of_birth = data.date_of_birth;
  if (data.gender !== undefined) payload.gender = data.gender;

  return api.patch('/users/me', payload);
};

/**
 * Lấy danh sách địa chỉ nhận hàng của người dùng hiện tại
 */
export const getAddressesApi = () => {
  return api.get('/users/me/addresses');
};

/**
 * Lấy chi tiết một địa chỉ nhận hàng
 * @param {number|string} addressId
 */
export const getAddressDetailApi = (addressId) => {
  return api.get(`/users/me/addresses/${addressId}`);
};

/**
 * Tạo mới địa chỉ nhận hàng
 * @param {{
 *   receiver_name_user_address: string,
 *   phone_user_address: string,
 *   address_line_user_address: string,
 *   ward_user_address?: string,
 *   district_user_address?: string,
 *   province_user_address?: string,
 *   is_default?: boolean
 * }} data
 */
export const createAddressApi = (data) => {
  return api.post('/users/me/addresses', data);
};

/**
 * Cập nhật địa chỉ nhận hàng (PATCH)
 * @param {number|string} addressId
 * @param {{
 *   receiver_name_user_address?: string,
 *   phone_user_address?: string,
 *   address_line_user_address?: string,
 *   ward_user_address?: string,
 *   district_user_address?: string,
 *   province_user_address?: string
 * }} data
 */
export const updateAddressApi = (addressId, data) => {
  const { 
    is_default: _is_default, 
    user_address_id: _user_address_id, 
    user_id: _user_id, 
    created_at: _created_at, 
    updated_at: _updated_at, 
    ...updatePayload 
  } = data;
  return api.patch(`/users/me/addresses/${addressId}`, updatePayload);
};

/**
 * Xóa địa chỉ nhận hàng
 * @param {number|string} addressId
 */
export const deleteAddressApi = (addressId) => {
  return api.delete(`/users/me/addresses/${addressId}`);
};

/**
 * Đặt địa chỉ làm mặc định
 * @param {number|string} addressId
 */
export const setDefaultAddressApi = (addressId) => {
  return api.patch(`/users/me/addresses/${addressId}/default`);
};

/**
 * Đổi mật khẩu tài khoản người dùng
 * @param {{ currentPassword?: string, newPassword: string }} data
 */
export const changePasswordApi = (data) => {
  return api.post('/users/me/change-password', data);
};

