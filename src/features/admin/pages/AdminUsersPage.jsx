'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminUsers } from '../hooks/useAdmin';
import { useAuthStore } from '@/shared/store/authStore';
import Icon from '../../../shared/components/Icon';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Pagination from '../../../shared/components/Pagination';
import AdminPageHeader from '../components/AdminPageHeader';
import ErrorState from '../../../shared/components/ErrorState';

export default function AdminUsersPage() {
  const router = useRouter();
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
    isError,
    refetch,
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

  if (isError && !isLoading) {
    return <ErrorState onRetry={refetch} title="Không thể tải danh sách người dùng" />;
  }

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
    <div className="mx-auto max-w-7xl space-y-6 font-sans font-[550]">
      <AdminPageHeader
        eyebrow="Khách hàng & Hệ thống"
        title={`Quản lý người dùng (${total})`}
        description="Danh sách tài khoản khách hàng, quản trị viên và trạng thái truy cập."
      />

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
              className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-11 pr-4 font-sans text-xs font-normal text-black transition-colors placeholder:text-neutral-400 focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
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
              className="cursor-pointer rounded-xl border border-neutral-200 bg-white px-3.5 py-2 font-sans text-xs font-[550] text-neutral-700 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
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
              className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 font-sans text-xs font-[550] uppercase tracking-wider transition-all ${
                roleFilter === tab.value
                  ? 'bg-black text-white shadow-sm dark:bg-white dark:text-black'
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
              <table className="w-full text-left font-sans text-xs">
                <thead className="uppercase text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="pb-3 font-sans font-[550]">Người dùng</th>
                    <th className="pb-3 font-sans font-[550]">Số điện thoại</th>
                    <th className="pb-3 text-center font-sans font-[550]">Vai trò</th>
                    <th className="pb-3 text-center font-sans font-[550]">Trạng thái</th>
                    <th className="pb-3 font-sans font-[550]">Ngày tham gia</th>
                    <th className="pb-3 text-right font-sans font-[550]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center font-normal text-neutral-400">
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
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-sans text-xs font-[550] text-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
                                {usr.full_name?.charAt(0) || usr.email?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="line-clamp-1 font-sans font-[550] text-black dark:text-white">
                                  {usr.full_name || 'Chưa đặt tên'} {isSelf && <span className="text-[9px] text-neutral-400 font-normal">(Bạn)</span>}
                                </h4>
                                <p className="font-sans text-[10px] font-[550] text-neutral-400">{usr.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 font-sans font-[550] text-neutral-500">
                            {usr.phone || 'Chưa cập nhật'}
                          </td>

                          <td className="py-4 text-center">
                            {usr.role === 'admin' ? (
                              <span className="rounded-full bg-purple-100 px-2.5 py-1 font-sans text-[10px] font-[550] uppercase tracking-wider text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                                Admin
                              </span>
                            ) : (
                              <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-sans text-[10px] font-[550] uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                Khách hàng
                              </span>
                            )}
                          </td>

                          <td className="py-4 text-center">
                            {isActive && (
                                <span className="inline-flex items-center gap-1 font-sans text-[10px] font-[550] text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Hoạt động
                              </span>
                            )}
                            {isInactive && (
                                <span className="inline-flex items-center gap-1 font-sans text-[10px] font-[550] text-neutral-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                Không hoạt động
                              </span>
                            )}
                            {isBlocked && (
                                <span className="inline-flex items-center gap-1 font-sans text-[10px] font-[550] text-rose-600 dark:text-rose-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Đã khóa
                              </span>
                            )}
                          </td>

                          <td className="py-4 font-sans text-[10px] font-[550] text-neutral-400">
                            {new Date(usr.created_at || Date.now()).toLocaleDateString('vi-VN')}
                          </td>

                          <td className="py-4 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/users/${usr.user_id}`)}
                              className="cursor-pointer rounded-lg bg-neutral-100 px-2.5 py-1 font-sans text-[10px] font-[550] uppercase tracking-wider text-black transition-all hover:bg-black hover:text-white dark:bg-neutral-800 dark:text-white dark:hover:bg-white dark:hover:text-black"
                            >
                              Chi tiết
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(usr)}
                                disabled={isUserActionPending}
                              className={`cursor-pointer rounded-lg px-2.5 py-1 font-sans text-[10px] font-[550] uppercase tracking-wider transition-all disabled:opacity-40 ${
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
