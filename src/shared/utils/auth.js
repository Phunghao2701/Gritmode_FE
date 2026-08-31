/**
 * shared/utils/auth.js
 *
 * Legacy auth utilities — được giữ lại để không break các component cũ.
 * Logic auth chính đã chuyển sang useAuth hook + tokenService.
 */
import { useAuthStore } from '../../app/store/authStore';
import { tokenService } from '../../features/auth/services/token.service';
import api from '../services/api';

/**
 * @deprecated Không dùng trực tiếp trong code mới.
 * Xóa token (hiện dùng tokenService).
 */
export const removeToken = () => {
  tokenService.clearAllTokens();
};

/**
 * @deprecated Dùng AuthInit trong App.jsx để restore session.
 * Hàm này được giữ lại để tránh break AuthLayoutWithUser.jsx.
 *
 * Kiểm tra xem user có session hợp lệ không bằng cách gọi GET /auth/me.
 */
export const isAuthenticated = async () => {
  try {
    const authStore = useAuthStore.getState();

    // Fast-path: nếu đã có user trong store (persist từ trước)
    if (authStore.isAuthenticated && authStore.user) {
      return true;
    }

    // Luôn gọi vì HttpOnly refresh cookie không thể được JavaScript kiểm tra.
    const res = await api.get('/auth/me');
    const userData = res.data?.data;

    if (userData) {
      authStore.loginSuccess(userData);
      return true;
    }

    return false;
  } catch {
    useAuthStore.getState().clearAuth();
    tokenService.clearAllTokens();
    return false;
  }
};
