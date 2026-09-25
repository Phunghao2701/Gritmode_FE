'use client';
import AdminRoute from '@/shared/routes/AdminRoute';
import AdminLayout from '@/shared/layouts/AdminLayout';

export default function Layout({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
