'use client';

import Icon from '../../shared/components/Icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNotificationBell from '../../features/admin/components/AdminNotificationBell';

export default function AdminHeader({ onMenuOpen }) {
  const pathname = usePathname();

  const getPageInfo = () => {
    const path = pathname || '';
    if (path.includes('/admin/products/create')) return { title: 'Thêm sản phẩm mới', parent: 'Sản phẩm', parentPath: '/admin/products' };
    if (path.includes('/admin/products/') && path.includes('/edit')) return { title: 'Chỉnh sửa sản phẩm', parent: 'Sản phẩm', parentPath: '/admin/products' };
    if (path.includes('/admin/products')) return { title: 'Quản lý sản phẩm', parent: 'Danh mục & Kho' };
    if (path.includes('/admin/orders')) return { title: 'Quản lý đơn hàng', parent: 'Bán hàng' };
    if (path.includes('/admin/inventory')) return { title: 'Quản lý kho & Tồn kho', parent: 'Danh mục & Kho' };
    if (path.includes('/admin/categories')) return { title: 'Quản lý danh mục', parent: 'Danh mục & Kho' };
    if (path.includes('/admin/collections/create')) return { title: 'Thêm nhóm mới', parent: 'Bộ sưu tập', parentPath: '/admin/collections' };
    if (path.includes('/admin/collections')) return { title: 'Quản lý bộ sưu tập', parent: 'Danh mục & Kho' };
    if (path.includes('/admin/users')) return { title: 'Quản lý khách hàng', parent: 'Hệ thống' };
    return { title: 'Bảng điều khiển tổng quan', parent: 'Tổng quan' };
  };

  const { title, parent, parentPath } = getPageInfo();

  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-black/95 backdrop-blur-md shrink-0 transition-colors select-none">
      <button type="button" onClick={onMenuOpen} className="lg:hidden -ml-2 grid size-11 shrink-0 place-items-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900" aria-label="Mở menu quản trị">
        <Icon icon="solar:hamburger-menu-linear" className="text-xl" />
      </button>
      <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
        {parentPath ? (
          <Link href={parentPath} className="text-neutral-400 hover:text-black dark:hover:text-white font-bold transition-colors">
            {parent}
          </Link>
        ) : (
          <span className="text-neutral-400 font-bold">{parent}</span>
        )}
        <span className="text-neutral-300 dark:text-neutral-700">/</span>
        <h2 className="truncate font-display font-black text-sm uppercase tracking-tight text-black dark:text-white">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <AdminNotificationBell />
      </div>
    </header>
  );
}
