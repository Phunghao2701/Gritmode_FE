/**
 * Auth API Endpoints — Gritmode Passwordless Email OTP
 *
 * Flow: Email → Request OTP → Verify OTP → BE create/login user automatically
 * FE không phân biệt Login/Register — Backend quyết định.
 */
import api from '../../../shared/services/api';

/**
 * Yêu cầu BE gửi OTP đến Email.
 * BE tự quyết định Email đã tồn tại hay chưa — FE không cần biết.
 * @param {string} email
 */
export const requestOtpApi = (email) => {
  return api.post('/auth/request-otp', { email });
};

/**
 * Xác thực OTP. BE sẽ tự động create/login user.
 * @param {{ email: string, otp: string, guest_token?: string }} payload
 */
export const verifyOtpApi = ({ email, otp, guest_token }) => {
  const body = { email, otp };
  if (guest_token) body.guest_token = guest_token;
  return api.post('/auth/verify-otp', body);
};

/**
 * Làm mới Access Token bằng HttpOnly refresh cookie.
 */
export const refreshTokenApi = () => {
  return api.post('/auth/refresh');
};

/**
 * Đăng xuất — Thu hồi session hiện tại ở BE.
 */
export const logoutApi = () => {
  return api.post('/auth/logout');
};

/**
 * Lấy thông tin User hiện tại từ BE.
 * Dùng để restore session khi App reload.
 */
export const getMeApi = () => {
  return api.get('/auth/me');
};
