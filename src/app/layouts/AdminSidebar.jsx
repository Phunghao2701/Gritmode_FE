import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../../shared/components/Icon';
import { useAuthStore } from '../store/authStore';
import ROUTES from '../routes/routePaths';
import { cn } from '../../shared/utils/cn';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuthStore();

  const menuItems = [
    { label: 'Tổng quan', path: ROUTES.ADMIN_DASHBOARD, icon: 'solar:chart-square-bold-duotone' },
    { label: 'Sản phẩm', path: ROUTES.ADMIN_PRODUCTS, icon: 'solar:t-shirt-bold-duotone' },
    { label: 'Đơn hàng', path: ROUTES.ADMIN_ORDERS, icon: 'solar:bag-check-bold-duotone' },
    { label: 'Quản lý kho', path: ROUTES.ADMIN_INVENTORY, icon: 'solar:box-minimalistic-bold-duotone' },
    { label: 'Danh mục', path: ROUTES.ADMIN_CATEGORIES, icon: 'solar:folder-with-files-bold-duotone' },
    { label: 'Khách hàng', path: ROUTES.ADMIN_USERS, icon: 'solar:users-group-rounded-bold-duotone' },
    { label: 'Nhật ký quản trị', path: ROUTES.ADMIN_AUDIT_LOGS, icon: 'solar:history-bold-duotone' },
  ];

  const isActive = (itemPath) => {
    if (itemPath === ROUTES.ADMIN_DASHBOARD) {
      return pathname === ROUTES.ADMIN_DASHBOARD || pathname === '/admin';
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <aside className="w-64 bg-black text-white min-h-screen flex flex-col justify-between border-r border-neutral-800 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-800/80">
          <div 
            onClick={() => navigate('/admin/dashboard')}
            className="cursor-pointer group flex flex-col items-start"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-xl tracking-tight uppercase leading-none">
                GRITMODE<span className="text-[10px] align-super font-sans">®</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 text-white px-2 py-0.5 rounded">
                Admin Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-3">
            Quản trị hệ thống
          </p>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left cursor-pointer",
                  active
                    ? "bg-white text-black shadow-md font-black"
                    : "hover:bg-neutral-900 text-neutral-400 hover:text-white"
                )}
              >
                <Icon icon={item.icon} className="text-lg shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Actions */}
      <div className="p-4 border-t border-neutral-800/80 space-y-3">
        {/* Current Admin User Badge */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">
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
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-neutral-400 hover:bg-neutral-900 hover:text-white transition-all text-left cursor-pointer"
          >
            <Icon icon="solar:shop-2-linear" className="text-base shrink-0" />
            <span>Về cửa hàng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all text-left cursor-pointer"
          >
            <Icon icon="solar:logout-2-linear" className="text-base shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
