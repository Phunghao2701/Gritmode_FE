'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Icon from '@/shared/components/Icon';
import { useAuthStore } from '@/shared/store/authStore';
import { useCartStore } from '@/shared/store/cartStore';
import ROUTES from '@/shared/routes/routePaths';

// Dynamic lazy imports for heavy overlays (0kb initial JS)
const DynamicSearchModal = dynamic(() => import('./SearchModal'), { ssr: false });
const DynamicCartDrawer = dynamic(() => import('@/features/cart/components/CartDrawer'), { ssr: false });

export default function HeaderActions({ isWhiteTheme = true, isTextSolidWhite = false }) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hasOpenedCart, setHasOpenedCart] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { getTotalItems, openDrawer, isDrawerOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      setHasOpenedCart(true);
    }
  }, [isDrawerOpen]);

  const cartItemCount = mounted ? getTotalItems() : 0;
  const authed = mounted && isAuthenticated;

  return (
    <>
      {/* Capsule Action Pill */}
      <div
        className={`flex items-center rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-[border-color,background-color] duration-150 ease-out ${
          isWhiteTheme
            ? 'border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white shadow-sm'
            : isTextSolidWhite
            ? 'border border-white/40 bg-white/15 backdrop-blur-xl shadow-inner text-white'
            : 'border border-white/15 bg-black/20 backdrop-blur-sm text-white/60'
        }`}
      >
        {/* Search Icon Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`p-1 transition-[color,opacity,transform] duration-150 ease-out cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
            isWhiteTheme
              ? 'text-black dark:text-white hover:opacity-60'
              : isTextSolidWhite
              ? 'text-white hover:opacity-75'
              : 'text-white/60 hover:text-white hover:opacity-100'
          }`}
          title="Tìm kiếm"
          aria-label="Search"
        >
          <Icon icon="solar:magnifer-linear" className="text-base sm:text-lg" />
        </button>

        <span
          className={`w-px h-3.5 mx-1.5 sm:mx-2 transition-colors duration-150 ease-out ${
            isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
          }`}
        />

        {/* User Profile / Login Direct Link */}
        <Link
          href={
            authed
              ? user?.role === 'admin'
                ? ROUTES.ADMIN_DASHBOARD
                : ROUTES.PROFILE
              : ROUTES.LOGIN
          }
          className={`p-1 transition-[color,opacity,transform] duration-150 ease-out cursor-pointer flex items-center hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
            isWhiteTheme
              ? 'text-black dark:text-white hover:opacity-60'
              : isTextSolidWhite
              ? 'text-white hover:opacity-75'
              : 'text-white/60 hover:text-white hover:opacity-100'
          }`}
          title={authed ? user?.fullName || user?.email || 'Tài khoản' : 'Đăng nhập'}
          aria-label="Account"
        >
          <Icon icon="solar:user-linear" className="text-base sm:text-lg" />
        </Link>

        <span
          className={`w-px h-3.5 mx-1.5 sm:mx-2 transition-colors duration-150 ease-out ${
            isWhiteTheme ? 'bg-neutral-300 dark:bg-neutral-700' : 'bg-white/20'
          }`}
        />

        {/* Shopping Bag with live count badge */}
        <button
          onClick={openDrawer}
          className={`relative p-1 transition-[color,opacity,transform] duration-150 ease-out flex items-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white rounded-full ${
            isWhiteTheme
              ? 'text-black dark:text-white hover:opacity-60'
              : isTextSolidWhite
              ? 'text-white hover:opacity-75'
              : 'text-white/60 hover:text-white hover:opacity-100'
          }`}
          title="Giỏ hàng"
          aria-label="Cart"
        >
          <Icon icon="solar:bag-3-bold" className="text-base sm:text-lg" />
          <span
            suppressHydrationWarning
            className="text-[11px] sm:text-xs font-black min-w-[12px] sm:min-w-[14px] text-center"
          >
            {cartItemCount}
          </span>
        </button>
      </div>

      {/* Lazy Dynamic Search Modal */}
      {isSearchOpen && (
        <DynamicSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}

      {/* Lazy Dynamic Cart Drawer */}
      {hasOpenedCart && <DynamicCartDrawer />}
    </>
  );
}
