import { create } from 'zustand';

/**
 * Auth Store — Gritmode
 *
 * State quản lý phiên đăng nhập người dùng (In-Memory).
 * Source of truth cho authentication state toàn ứng dụng.
 * Không persist thông tin user/role vào localStorage để tránh UI tampering và rủi ro bảo mật.
 *
 * - isInitialized: App đã xác minh session với BE chưa (dùng để ProtectedRoute không redirect sớm)
 * - isAuthenticated: User đang được xác thực
 * - user: Dữ liệu user từ BE (không tự set role/status)
 */

// Dọn dẹp storage cũ nếu từng lưu
try {
  localStorage.removeItem('gritmode-auth-storage');
} catch {
  // Bỏ qua
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isAuthLoading: false,
  error: null,

  /**
   * Được gọi sau khi Verify OTP hoặc Refresh session thành công.
   * Lưu user vào state — token được quản lý trong RAM bởi tokenService.
   */
  loginSuccess: (user) =>
    set({
      user,
      isAuthenticated: true,
      error: null,
    }),

  /** Sync user data mới nhất từ BE (GET /auth/me hoặc Refresh) */
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

  /** Set sau khi restoreAuth() hoàn tất — dù thành công hay thất bại */
  setInitialized: (value) => set({ isInitialized: value }),

  /** Loading indicator khi đang restore session */
  setAuthLoading: (value) => set({ isAuthLoading: value }),

  setError: (error) => set({ error }),

  /**
   * Xóa toàn bộ auth state.
   */
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isAuthLoading: false,
    }),

  // Alias cho backward compat nếu có component cũ gọi .logout()
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isAuthLoading: false,
    }),
}));