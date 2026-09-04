import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdmin';
import { useAuthStore } from '../../../app/store/authStore';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { user: currentAdmin } = useAuthStore();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    users,
    isLoading,
    total,
    blockUser,
    unblockUser,
    isUserActionPending,
  } = useAdminUsers({
    search: debouncedSearch.trim() || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const roleTabs = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'customer', label: 'Khách hàng' },
    { value: 'admin', label: 'Quản trị viên' },
  ];

  const handleActionSuccess = () => {};

  const handleToggleBlock = (usr) => {
    if (usr.user_id === currentAdmin?.user_id) {
      alert('Bạn không thể tự khóa tài khoản quản trị viên của chính mình.');
      return;
    }

    if (usr.status === 'blocked') {
      if (window.confirm(`Mở khóa tài khoản ${usr.email}?`)) {
        unblockUser(usr.user_id, { onSuccess: handleActionSuccess });
      }
    } else {
      if (window.confirm(`Khóa tài khoản ${usr.email}? Mọi phiên đăng nhập của người dùng sẽ bị thu hồi ngay lập tức.`)) {
        blockUser(usr.user_id, { onSuccess: handleActionSuccess });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Accounts & Access Control
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-1">
            Quản lý người dùng ({total})
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Danh sách tài khoản khách hàng, quản trị viên, kiểm soát trạng thái hoạt động và khóa tài khoản vi phạm.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
            <input
              type="text"
              placeholder="Tìm theo email, họ tên, hoặc số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="">Trạng thái: Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="blocked">Đã bị khóa</option>
            </select>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setRoleFilter(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                roleFilter === tab.value
                  ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <LoadingSkeleton key={n} height="55px" className="rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-black">Người dùng</th>
                    <th className="pb-3 font-black">Số điện thoại</th>
                    <th className="pb-3 font-black text-center">Vai trò</th>
                    <th className="pb-3 font-black text-center">Trạng thái</th>
                    <th className="pb-3 font-black">Ngày tham gia</th>
                    <th className="pb-3 font-black text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        Không tìm thấy tài khoản người dùng nào.
                      </td>
                    </tr>
                  ) : (
                    users.map((usr) => {
                      const isSelf = usr.user_id === currentAdmin?.user_id;
                      const isBlocked = usr.status === 'blocked';
                      const isInactive = usr.status === 'inactive';
                      const isActive = usr.status === 'active';

                      return (
                        <tr key={usr.user_id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-black text-xs text-black dark:text-white shrink-0">
                                {usr.full_name?.charAt(0) || usr.email?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="font-bold text-black dark:text-white line-clamp-1">
                                  {usr.full_name || 'Chưa đặt tên'} {isSelf && <span className="text-[9px] text-neutral-400 font-normal">(Bạn)</span>}
                                </h4>
                                <p className="text-[10px] text-neutral-400 font-mono">{usr.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 font-mono text-neutral-500">
                            {usr.phone || 'Chưa cập nhật'}
                          </td>

                          <td className="py-4 text-center">
                            {usr.role === 'admin' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                                Khách hàng
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-center">
                            {isActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Hoạt động
                              </span>
                            )}
                            {isInactive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                Không hoạt động
                              </span>
                            )}
                            {isBlocked && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Đã khóa
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-neutral-400 text-[10px] font-mono">
                            {new Date(usr.created_at || Date.now()).toLocaleDateString('vi-VN')}
                          </td>

                          <td className="py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/users/${usr.user_id}`)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-wider text-black dark:text-white transition-all cursor-pointer"
                            >
                              Chi tiết
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(usr)}
                                disabled={isUserActionPending}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 ${
                                  isBlocked
                                    ? 'border border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                    : 'border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                }`}
                              >
                                {isBlocked ? 'Mở khóa' : 'Khóa'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              totalItems={total}
              currentPage={page}
              limit={20}
              onPageChange={setPage}
              entityName="người dùng"
            />
          </div>
        )}
      </div>
    </div>
  );
}
