import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * AdminRoute — Chỉ cho phép user có role = 'admin' truy cập.
 *
 * Quan trọng:
 * - Role đọc trực tiếp từ user object do BE trả, không hard-code
 * - Đây là client-side guard — BE vẫn phải enforce authorization riêng
 * - Chờ isInitialized để tránh redirect sai khi reload
 */
export default function AdminRoute() {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role lấy từ BE — không hard-code 'admin'
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
