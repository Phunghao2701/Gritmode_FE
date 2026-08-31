import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

import LandingPage from '../../features/landing/pages/LandingPage';
import ProductListPage from '../../features/products/pages/ProductListPage';
import ProductDetailPage from '../../features/products/pages/ProductDetailPage';
import CheckoutPage from '../../features/checkout/pages/CheckoutPage';
import OrderSuccessPage from '../../features/checkout/pages/OrderSuccessPage';
import GuestOrderLookupPage from '../../features/orders/pages/GuestOrderLookupPage';
import PaymentResultPage from '../../features/payments/pages/PaymentResultPage';
import LoginPage from '../../features/auth/pages/LoginPage';
import ProfilePage from '../../features/profile/pages/ProfilePage';
import AdminDashboardPage from '../../features/admin/pages/AdminDashboardPage';
import AdminProductsPage from '../../features/admin/pages/AdminProductsPage';
import AdminOrdersPage from '../../features/admin/pages/AdminOrdersPage';
import AdminInventoryPage from '../../features/admin/pages/AdminInventoryPage';
import AdminCategoriesPage from '../../features/admin/pages/AdminCategoriesPage';
import AdminUsersPage from '../../features/admin/pages/AdminUsersPage';
import AdminAuditLogsPage from '../../features/admin/pages/AdminAuditLogsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ============================================
          Public Customer Routes (Main Layout)
          Cart & Checkout không cần login — Guest support
          ============================================ */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/collections" element={<ProductListPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
        <Route path="/orders/lookup" element={<GuestOrderLookupPage />} />
        <Route path="/tra-cuu-don-hang" element={<GuestOrderLookupPage />} />
        <Route path="/payment/result" element={<PaymentResultPage />} />
        <Route path="/payment/cancel" element={<PaymentResultPage />} />

        {/* Protected: yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/*" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ============================================
          Auth Route — Chỉ cho Guest truy cập
          Không còn /register hay /forgot-password (passwordless OTP)
          ============================================ */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect các route cũ về login */}
      <Route path="/register" element={<Navigate to="/login" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

      {/* ============================================
          Admin Routes — yêu cầu role = admin
          ============================================ */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
