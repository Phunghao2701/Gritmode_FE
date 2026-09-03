import Icon from '../../shared/components/Icon';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function AdminHeader({ onMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;
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
          <Link to={parentPath} className="text-neutral-400 hover:text-black dark:hover:text-white font-bold transition-colors">
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
        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống trực tuyến</span>
        </div>

        {/* Back to store */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-xs font-bold uppercase tracking-wider text-black dark:text-white transition-all cursor-pointer"
        >
          <Icon icon="solar:shop-2-linear" className="text-sm" />
          <span className="hidden sm:inline">Xem Store</span>
        </button>
      </div>
    </header>
  );
}
