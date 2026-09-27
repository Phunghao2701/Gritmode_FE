'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/shared/components/Icon';
import PrimaryButton from '@/shared/components/Button/PrimaryButton';
import { useAuthStore } from '@/shared/store/authStore';
import useAuth from '@/features/auth/hooks/useAuth';
import ROUTES from '@/shared/routes/routePaths';
import { useCartStore } from '@/shared/store/cartStore';
import { useCategories } from '@/features/categories/hooks/useCategory';
import { useCollections } from '@/features/collections/hooks/useCollection';

export default function MobileNav({ isWhiteTheme = true, isTextSolidWhite = false }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuLevel, setMobileMenuLevel] = useState('main'); // 'main' | 'shop' | 'collections'
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState(null);

  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { getTotalItems, openDrawer } = useCartStore();
  const { categoryTree = [] } = useCategories();
  const { collections = [] } = useCollections();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = mounted ? getTotalItems() : 0;
  const authed = mounted && isAuthenticated;

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
    setMobileMenuLevel('main');
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={`lg:hidden p-1.5 sm:p-2 rounded-lg transition-[color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
          isWhiteTheme
            ? 'text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
            : isTextSolidWhite
            ? 'text-white hover:bg-white/10'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Open mobile menu"
      >
        <Icon icon="solar:hamburger-menu-linear" className="text-2xl sm:text-2xl" />
      </button>

      {/* Slide-out Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMenu} />

          <div className="fixed inset-y-0 left-0 max-w-sm w-full bg-white text-black shadow-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <button
                onClick={closeMenu}
                className="p-1 text-2xl text-neutral-800 hover:text-black cursor-pointer"
                aria-label="Đóng menu"
              >
                <Icon icon="solar:close-linear" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-display font-black text-lg tracking-tight text-black uppercase leading-none">
                  GRITMODE®
                </span>
                <span className="text-[8px] font-black tracking-widest uppercase text-neutral-500">
                  madeinvietnam
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    closeMenu();
                    router.push(isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN);
                  }}
                  className="p-1.5 text-neutral-800 hover:text-black cursor-pointer text-lg"
                  aria-label="Tài khoản"
                >
                  <Icon icon="solar:user-linear" />
                </button>
                <button
                  onClick={() => {
                    closeMenu();
                    openDrawer();
                  }}
                  className="relative p-1.5 text-neutral-800 hover:text-black cursor-pointer text-lg"
                  aria-label="Giỏ hàng"
                >
                  <Icon icon="solar:bag-linear" />
                  {cartItemCount > 0 && (
                    <span
                      suppressHydrationWarning
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center"
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Menu Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {/* LEVEL 1: Main Menu */}
              {mobileMenuLevel === 'main' && (
                <nav className="space-y-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
                  <button
                    onClick={() => setMobileMenuLevel('shop')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <span>SHOP</span>
                    <Icon icon="solar:alt-arrow-right-linear" className="text-base text-neutral-800" />
                  </button>

                  <button
                    onClick={() => setMobileMenuLevel('collections')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-neutral-600 transition-colors cursor-pointer"
                  >
                    <span>COLLECTIONS</span>
                    <Icon icon="solar:alt-arrow-right-linear" className="text-base text-neutral-800" />
                  </button>

                  <Link
                    href={ROUTES.CONTACT}
                    onClick={closeMenu}
                    className="block py-2 hover:text-neutral-600 transition-colors"
                  >
                    CONTACT
                  </Link>

                  <Link
                    href={ROUTES.ABOUT_US}
                    onClick={closeMenu}
                    className="block py-2 hover:text-neutral-600 transition-colors"
                  >
                    ABOUT US
                  </Link>
                </nav>
              )}

              {/* LEVEL 2: Shop Submenu */}
              {mobileMenuLevel === 'shop' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-200">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <button
                      onClick={() => setMobileMenuLevel('main')}
                      className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      aria-label="Quay lại"
                    >
                      <Icon icon="solar:arrow-left-linear" className="text-sm" />
                    </button>
                    <span className="text-xs text-neutral-400 font-normal">
                      Menu/<span className="text-black font-semibold">Shop</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {categoryTree && categoryTree.length > 0 ? (
                      categoryTree.map((cat) => {
                        const hasChildren = cat.children && cat.children.length > 0;
                        const isExpanded = mobileExpandedCategory === cat.category_id;

                        return (
                          <div key={cat.category_id} className="border-b border-neutral-100 pb-2">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/products?category=${cat.slug_category || cat.slug}`}
                                onClick={closeMenu}
                                className="text-sm font-bold uppercase tracking-wider text-black hover:text-neutral-600 py-1"
                              >
                                {cat.name_category}
                              </Link>
                              {hasChildren && (
                                <button
                                  onClick={() =>
                                    setMobileExpandedCategory(isExpanded ? null : cat.category_id)
                                  }
                                  className="p-1.5 text-neutral-700 hover:text-black cursor-pointer"
                                >
                                  <Icon
                                    icon={
                                      isExpanded
                                        ? 'solar:alt-arrow-up-linear'
                                        : 'solar:alt-arrow-right-linear'
                                    }
                                    className="text-base"
                                  />
                                </button>
                              )}
                            </div>

                            {hasChildren && isExpanded && (
                              <div className="pl-3 pt-2 pb-1 space-y-2 text-neutral-600 text-xs font-normal">
                                {cat.children.map((sub) => (
                                  <Link
                                    key={sub.category_id}
                                    href={`/products?category=${sub.slug_category || sub.slug}`}
                                    onClick={closeMenu}
                                    className="block py-1 hover:text-black"
                                  >
                                    {sub.name_category}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-neutral-400 text-xs font-normal">
                        Chưa có danh mục nào
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* LEVEL 2: Collections Submenu */}
              {mobileMenuLevel === 'collections' && (
                <div className="space-y-4 animate-in slide-in-from-right duration-200">
                  <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                    <button
                      onClick={() => setMobileMenuLevel('main')}
                      className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                      aria-label="Quay lại"
                    >
                      <Icon icon="solar:arrow-left-linear" className="text-sm" />
                    </button>
                    <span className="text-xs text-neutral-400 font-normal">
                      Menu/<span className="text-black font-semibold">Collections</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-sm font-bold uppercase tracking-wider">
                    <Link
                      href="/collections"
                      onClick={closeMenu}
                      className="block py-2 text-black hover:text-neutral-600 border-b border-neutral-100"
                    >
                      TẤT CẢ BỘ SƯU TẬP
                    </Link>
                    {collections && collections.length > 0 ? (
                      collections.map((col) => (
                        <Link
                          key={col.collection_id}
                          href={`/products?collection=${col.slug_collection || col.slug}`}
                          onClick={closeMenu}
                          className="block py-2 text-neutral-700 hover:text-black border-b border-neutral-100 font-normal text-xs"
                        >
                          {col.name_collection}
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-400 py-2 font-normal">Đang cập nhật...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Auth Bar */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-xs font-normal text-neutral-600">{user?.email}</p>
                  <PrimaryButton
                    variant="outline"
                    size="sm"
                    className="w-full text-black border-neutral-300 hover:bg-neutral-200 text-xs font-[550]"
                    onClick={() => {
                      closeMenu();
                      router.push(ROUTES.PROFILE);
                    }}
                  >
                    Tài khoản của tôi
                  </PrimaryButton>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="w-full text-center text-xs font-normal text-neutral-500 hover:text-rose-600 cursor-pointer pt-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      closeMenu();
                      router.push(ROUTES.LOGIN);
                    }}
                    className="py-2.5 rounded-xl border border-neutral-300 text-black text-xs font-[550] uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      closeMenu();
                      router.push(ROUTES.LOGIN);
                    }}
                    className="py-2.5 rounded-xl bg-black text-white text-xs font-[550] uppercase tracking-wider hover:opacity-85 transition-opacity"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
