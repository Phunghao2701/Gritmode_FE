import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute — Chặn route yêu cầu đăng nhập.
 *
 * Quy tắc:
 * - Chờ isInitialized = true (restoreAuth xong) mới quyết định redirect
 * - Nếu chưa đăng nhập → redirect /login với state.from để quay lại sau khi login
 * - Không chặn: Cart, Checkout, Product (hệ thống hỗ trợ Guest)
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const location = useLocation();

  // Chờ App restore session xong — tránh flash redirect khi user đã login
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Đang khởi tạo...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
