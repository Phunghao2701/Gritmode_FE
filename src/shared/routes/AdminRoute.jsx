'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import AdminLoadingSkeleton from '@/features/admin/components/AdminLoadingSkeleton';

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
    return <AdminLoadingSkeleton fullScreen />;
  }

  return children;
}
