'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Icon from '../../shared/components/Icon';
import { useAuthStore } from '../store/authStore';
import useAuth from '../../features/auth/hooks/useAuth';
import ROUTES from '../routes/routePaths';
import { cn } from '../../shared/utils/cn';

export default function AdminSidebar({ isOpen = false, onClose = () => {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const navigationSections = [
    {
      group: 'Tổng quan',
      items: [
        { label: 'Bảng điều khiển', path: ROUTES.ADMIN_DASHBOARD, icon: 'solar:chart-square-bold-duotone' },
      ]
    },
    {
      group: 'Vận hành bán hàng',
      items: [
        { label: 'Đơn hàng', path: ROUTES.ADMIN_ORDERS, icon: 'solar:bag-check-bold-duotone' },
      ]
    },
    {
      group: 'Sản phẩm & Kho',
      items: [
        {
          label: 'Sản phẩm',
          path: ROUTES.ADMIN_PRODUCTS,
          activePaths: [
            ROUTES.ADMIN_PRODUCTS,
            ROUTES.ADMIN_INVENTORY,
            ROUTES.ADMIN_CATEGORIES,
            ROUTES.ADMIN_COLLECTIONS,
          ],
          icon: 'solar:box-minimalistic-bold-duotone',
        },
      ]
    },
    {
      group: 'Marketing',
      items: [
        { label: 'Banner Trang Chủ', path: ROUTES.ADMIN_BANNERS, icon: 'solar:gallery-edit-bold-duotone' },
      ]
    },
    {
      group: 'Khách hàng & Hệ thống',
      items: [
        { label: 'Khách hàng', path: ROUTES.ADMIN_USERS, icon: 'solar:users-group-rounded-bold-duotone' },
      ]
    }
  ];

  const isActive = (item) => {
    const paths = item.activePaths || [item.path];

    return paths.some((itemPath) => {
      if (itemPath === ROUTES.ADMIN_DASHBOARD) {
        return pathname === ROUTES.ADMIN_DASHBOARD || pathname === '/admin' || pathname === '/admin/';
      }
      return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
    });
  };

  const goTo = (path) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Đóng menu quản trị" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(16rem,85vw)] shrink-0 select-none flex-col justify-between overflow-hidden border-r border-neutral-800 bg-black text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-40 lg:h-screen lg:w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Scrollable upper container */}
      <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800/80 shrink-0">
          <Link
            href={ROUTES.ADMIN_DASHBOARD}
            onClick={onClose}
            className="group flex cursor-pointer flex-col items-start"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-display font-[550] text-xl tracking-tight uppercase leading-none text-white">
                GRITMODE<span className="text-[10px] align-super font-sans">®</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-[550] uppercase tracking-widest bg-white/10 text-white px-2 py-0.5 rounded">
                Admin Console
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </Link>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="p-4 space-y-6 flex-1">
          {navigationSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {section.group && (
                <p className="px-3 text-[10px] font-[550] uppercase tracking-widest text-neutral-500">
                  {section.group}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => goTo(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-[550] uppercase tracking-wider transition-all text-left cursor-pointer",
                      active
                        ? "bg-white text-black shadow-md font-[550]"
                        : "hover:bg-neutral-900 text-neutral-400 hover:text-white"
                    )}
                  >
                    <Icon icon={item.icon} className="text-lg shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sticky User Info & Footer Actions */}
      <div className="p-4 border-t border-neutral-800/80 space-y-3 shrink-0 bg-black/95 backdrop-blur-sm z-10">
        {/* Current Admin User Badge */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-[550] text-xs shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-[550] text-white truncate leading-tight">
              {user?.fullName || 'Quản trị viên'}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">
              {user?.email || 'admin@gritmode.vn'}
            </p>
          </div>
        </div>

        {/* Navigation back & Logout */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => goTo('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-[550] text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer"
          >
            <Icon icon="solar:shop-2-linear" className="text-base shrink-0" />
            <span>Về trang bán hàng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              goTo('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-[550] text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left cursor-pointer"
          >
            <Icon icon="solar:logout-2-linear" className="text-base shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}
