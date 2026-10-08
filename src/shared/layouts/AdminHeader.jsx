'use client';

import Icon from '../../shared/components/Icon';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminNotificationBell from '../../features/admin/components/AdminNotificationBell';
import AdminWorkspaceTabs from '../../features/admin/components/AdminWorkspaceTabs';

export default function AdminHeader({ onMenuOpen }) {
  const pathname = usePathname();

  const getPageInfo = () => {
    const path = pathname || '';
    if (path.includes('/admin/products/create')) return { title: 'Thêm sản phẩm mới', parent: 'Sản phẩm', parentPath: '/admin/products' };
    if (path.includes('/admin/products/') && path.includes('/edit')) return { title: 'Chỉnh sửa sản phẩm', parent: 'Sản phẩm', parentPath: '/admin/products' };
    if (path.includes('/admin/products')) return { title: 'Quản lý sản phẩm', parent: 'Sản phẩm & Kho' };
    if (path.includes('/admin/orders')) return { title: 'Quản lý đơn hàng', parent: 'Vận hành bán hàng' };
    if (path.includes('/admin/inventory')) return { title: 'Quản lý kho & Tồn kho', parent: 'Sản phẩm & Kho' };
    if (path.includes('/admin/categories')) return { title: 'Quản lý danh mục', parent: 'Sản phẩm & Kho' };
    if (path.includes('/admin/collections/create')) return { title: 'Thêm nhóm mới', parent: 'Bộ sưu tập', parentPath: '/admin/collections' };
    if (path.includes('/admin/collections')) return { title: 'Quản lý bộ sưu tập', parent: 'Sản phẩm & Kho' };
    if (path.includes('/admin/banners')) return { title: 'Quản lý banner trang chủ', parent: 'Marketing' };
    if (path.includes('/admin/users')) return { title: 'Quản lý khách hàng', parent: 'Khách hàng & Hệ thống' };
    return { title: 'Bảng điều khiển tổng quan', parent: 'Tổng quan' };
  };

  const { title, parent, parentPath } = getPageInfo();
  const isCatalogWorkspace = ['/admin/products', '/admin/inventory', '/admin/categories', '/admin/collections']
    .some((path) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <header className="sticky top-0 z-30 flex min-h-16 shrink-0 flex-wrap items-center border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-black/95 select-none sm:px-6 lg:px-8">
      <div className="flex min-h-16 w-full items-center justify-between gap-3">
        <button type="button" onClick={onMenuOpen} className="-ml-2 grid size-11 shrink-0 place-items-center rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden" aria-label="Mở menu quản trị">
          <Icon icon="solar:hamburger-menu-linear" className="text-xl" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-xs">
          {parentPath ? (
            <Link href={parentPath} className="font-[550] text-neutral-400 transition-colors hover:text-black dark:hover:text-white">
              {parent}
            </Link>
          ) : (
            <span className="font-[550] text-neutral-400">{parent}</span>
          )}
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <h2 className="truncate font-display text-sm font-[550] uppercase tracking-tight text-black dark:text-white">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <AdminNotificationBell />
        </div>
      </div>
      {isCatalogWorkspace && (
        <div className="w-full pb-2 pl-9 sm:pl-0">
          <AdminWorkspaceTabs />
        </div>
      )}
    </header>
  );
}
