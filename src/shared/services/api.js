/**
 * Axios HTTP Client — Gritmode FE
 *
 * Contract hiện tại:
 * - Access Token: gửi qua Authorization header (lấy từ tokenService)
 * - Refresh Token: trình duyệt gửi tự động qua HttpOnly cookie
 * - 401 → queue pending requests → refresh 1 lần duy nhất → retry tất cả
 * - Nếu refresh cũng 401 → clearAllTokens + clearAuth
 */
import axios from 'axios';
import { tokenService } from '../../features/auth/services/token.service';
import { guestTokenService } from '../../features/cart/services/guestToken.service';

// --- Axios instance chính ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request interceptor: đính kèm Access Token hoặc Guest Token ---
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      const guestToken = guestTokenService.getGuestToken();
      if (guestToken) {
        config.headers['X-Guest-Token'] = guestToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Queue-based Token Refresh ---
// Đảm bảo chỉ gọi /auth/refresh 1 lần dù nhiều request cùng lúc bị 401

let isRefreshing = false;
let pendingQueue = []; // [{ resolve, reject }]

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

// --- Response interceptor: xử lý 401 ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ xử lý 401 và không phải request refresh chính nó
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._isRefreshRequest
    ) {
      // Nếu đang refresh → queue request hiện tại chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi trực tiếp qua axios (không qua instance `api`) để tránh interceptor loop
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true, _isRefreshRequest: true }
        );

        const newAccessToken = res.data?.data?.access_token;

        if (newAccessToken) {
          tokenService.setAccessToken(newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('No access_token in refresh response');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        const { clearQueryCache } = await import('./queryClient');
        await clearQueryCache();
        tokenService.clearAllTokens();

        const { useAuthStore } = await import('../../app/store/authStore');
        useAuthStore.getState().clearAuth();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// --- Public API instance (không có token, không có refresh) ---
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
