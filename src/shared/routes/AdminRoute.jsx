'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

/**
 * AdminRoute — Chỉ cho phép user có role = 'admin' truy cập trong Next.js App Router.
 */
export default function AdminRoute({ children }) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [isInitialized, isAuthenticated, isAdmin, router]);

  if (!isInitialized || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return children;
}
