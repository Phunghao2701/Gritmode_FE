import React from 'react';
import Icon from '../../shared/components/Icon';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/products')) return 'Quản lý sản phẩm';
    if (path.includes('/admin/orders')) return 'Quản lý đơn hàng';
    if (path.includes('/admin/inventory')) return 'Quản lý kho hàng & Tồn kho';
    if (path.includes('/admin/categories')) return 'Quản lý danh mục';
    if (path.includes('/admin/users')) return 'Quản lý khách hàng';
    return 'Bảng điều khiển tổng quan';
  };

  return (
    <header className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black shrink-0 transition-colors select-none">
      <div className="flex items-center gap-3">
        <h2 className="font-display font-black text-lg uppercase tracking-tight text-black dark:text-white">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống trực tuyến</span>
        </div>

        {/* Back to store */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-xs font-bold uppercase tracking-wider text-black dark:text-white transition-all cursor-pointer"
        >
          <Icon icon="solar:arrow-left-linear" />
          <span>Xem Store</span>
        </button>
      </div>
    </header>
  );
}
