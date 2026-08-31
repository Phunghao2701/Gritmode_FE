import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store — Gritmode
 *
 * State quản lý phiên đăng nhập người dùng.
 * Source of truth cho authentication state toàn ứng dụng.
 *
 * - isInitialized: App đã xác minh session với BE chưa (dùng để ProtectedRoute không redirect sớm)
 * - isAuthenticated: User đang được xác thực
 * - user: Dữ liệu user từ BE (không tự set role/status)
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      isAuthLoading: false,
      error: null,

      /**
       * Được gọi sau khi Verify OTP thành công.
       * Lưu user vào state — token được quản lý riêng bởi tokenService.
       */
      loginSuccess: (user) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),

      /** Sync user data mới nhất từ BE (GET /auth/me) */
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),

      /** Set sau khi restoreAuth() hoàn tất — dù thành công hay thất bại */
      setInitialized: (value) => set({ isInitialized: value }),

      /** Loading indicator khi đang restore session */
      setAuthLoading: (value) => set({ isAuthLoading: value }),

      setError: (error) => set({ error }),

      /**
       * Xóa toàn bộ auth state.
       * Tokens sẽ được xóa riêng bởi tokenService trong useAuth hook.
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
    }),
    {
      name: 'gritmode-auth-storage',
      // Chỉ persist user info — token được quản lý bởi tokenService (localStorage riêng)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);