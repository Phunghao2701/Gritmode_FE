import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const LandingPage = lazy(() => import('../../features/landing/pages/LandingPage'));
const ProductListPage = lazy(() => import('../../features/products/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('../../features/products/pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../../features/checkout/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('../../features/checkout/pages/OrderSuccessPage'));
const GuestOrderLookupPage = lazy(() => import('../../features/orders/pages/GuestOrderLookupPage'));
const PaymentResultPage = lazy(() => import('../../features/payments/pages/PaymentResultPage'));
const ContactPage = lazy(() => import('../../features/contact/pages/ContactPage'));
const AboutUsPage = lazy(() => import('../../features/about/pages/AboutUsPage'));
const PolicyPage = lazy(() => import('../../features/policies/pages/PolicyPage'));
const SizeGuidePage = lazy(() => import('../../features/policies/pages/SizeGuidePage'));
const HowToOrderPage = lazy(() => import('../../features/policies/pages/HowToOrderPage'));
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('../../features/admin/pages/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('../../features/admin/pages/AdminProductsPage'));
const AdminProductEditPage = lazy(() => import('../../features/admin/pages/AdminProductEditPage'));
const AdminCategoriesPage = lazy(() => import('../../features/admin/pages/AdminCategoriesPage'));
const AdminCategoryEditPage = lazy(() => import('../../features/admin/pages/AdminCategoryEditPage'));
const AdminCollectionsPage = lazy(() => import('../../features/admin/pages/AdminCollectionsPage'));
const AdminCollectionCreatePage = lazy(() => import('../../features/admin/pages/AdminCollectionCreatePage'));
const AdminOrdersPage = lazy(() => import('../../features/admin/pages/AdminOrdersPage'));
const AdminInventoryPage = lazy(() => import('../../features/admin/pages/AdminInventoryPage'));
const AdminUsersPage = lazy(() => import('../../features/admin/pages/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('../../features/admin/pages/AdminUserDetailPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" role="status" aria-label="Đang tải trang" />}>
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
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/about" element={<AboutUsPage />} />

        {/* Customer Support & Guides */}
        <Route path="/size-guide" element={<SizeGuidePage />} />
        <Route path="/how-to-order" element={<HowToOrderPage />} />

        {/* Customer Policies */}
        <Route path="/policies/:slug" element={<PolicyPage />} />
        <Route path="/policies/return" element={<PolicyPage policySlug="return" />} />
        <Route path="/policies/shipping" element={<PolicyPage policySlug="shipping" />} />
        <Route path="/policies/warranty" element={<PolicyPage policySlug="warranty" />} />
        <Route path="/policies/payment" element={<PolicyPage policySlug="payment" />} />
        <Route path="/policies/privacy" element={<PolicyPage policySlug="privacy" />} />
        <Route path="/policies/terms" element={<PolicyPage policySlug="terms" />} />

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
          <Route path="products/create" element={<AdminProductEditPage />} />
          <Route path="products/:id/edit" element={<AdminProductEditPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="categories/create" element={<AdminCategoryEditPage />} />
          <Route path="categories/:categoryId/edit" element={<AdminCategoryEditPage />} />
          <Route path="collections" element={<AdminCollectionsPage />} />
          <Route path="collections/create" element={<AdminCollectionCreatePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:userId" element={<AdminUserDetailPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
