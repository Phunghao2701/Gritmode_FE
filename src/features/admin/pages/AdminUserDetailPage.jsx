'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminUserDetail, useAdminUsers } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { formatPriceVND } from '../../products/utils/product.utils';
import { getOrderStatusInfo } from '../../orders/utils/order.utils';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params?.userId || params?.id;

  const { data: user, isLoading } = useAdminUserDetail(userId);
  const {
    blockUser,
    unblockUser,
    setUserInactive,
    isUserActionPending,
  } = useAdminUsers({}, { enabled: false });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 font-sans font-[550]">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-96 rounded-2xl" />
          <LoadingSkeleton className="h-96 rounded-2xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Icon icon="solar:user-cross-linear" className="text-3xl" />
        </div>
        <h2 className="font-sans text-lg font-[550] uppercase tracking-tight text-black dark:text-white">
          Không tìm thấy người dùng
        </h2>
        <p className="text-xs text-neutral-400">
          Người dùng #{userId} không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 font-sans text-xs font-[550] uppercase tracking-wider text-white dark:bg-white dark:text-black"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const orders = Array.isArray(user.orders) ? user.orders : [];

  const userStatus = user.status || user.status_user || 'active';
  const userRole = user.role || user.role_user || 'customer';
  const userName = user.full_name || user.name_user || user.name || 'Người dùng';
  const isBlocked = userStatus === 'blocked' || user.is_blocked;
  const isInactive = userStatus === 'inactive';

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 font-sans font-[550]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <div>
          <Link
            href="/admin/users"
            className="mb-2 inline-flex items-center gap-1.5 font-sans text-xs font-[550] text-neutral-400 transition-colors hover:text-black dark:hover:text-white"
          >
            <Icon icon="solar:arrow-left-linear" /> Quay lại danh sách khách hàng
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-100 font-sans text-sm font-[550] text-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-white">
              {userName.trim().charAt(0).toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h1 className="font-sans text-2xl font-[550] uppercase tracking-tight text-black dark:text-white sm:text-3xl">
              {userName}
            </h1>
            <span
              className={`rounded-full border px-3 py-1 font-sans text-[10px] font-[550] uppercase tracking-wider ${
                userRole === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
              }`}
            >
              {userRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tham gia: {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '—'}
          </p>
        </div>

        {/* User Account Controls */}
        <div className="flex items-center gap-2">
          {isBlocked ? (
            <PrimaryButton
              size="sm"
              icon="solar:lock-unlocked-bold"
              isLoading={isUserActionPending}
              onClick={() => unblockUser(user.user_id || user.id)}
            >
              Mở khóa tài khoản
            </PrimaryButton>
          ) : (
            <button
              type="button"
              disabled={isUserActionPending}
              onClick={() => blockUser(user.user_id || user.id)}
              className="cursor-pointer rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
            >
              Khóa tài khoản
            </button>
          )}

          {!isInactive && (
            <button
              type="button"
              disabled={isUserActionPending}
              onClick={() => setUserInactive(user.user_id || user.id)}
              className="cursor-pointer rounded-xl border border-neutral-200 px-4 py-2 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              Vô hiệu hóa
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (Profile & Addresses) & Right Column (Orders history) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 col): Profile info & Addresses */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center gap-2 border-b border-neutral-100 pb-3 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
              <Icon icon="solar:user-id-bold" /> Hồ sơ người dùng
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block font-sans text-[10px] font-[550] uppercase text-neutral-400">Email</span>
                <span className="font-sans font-[550] text-black dark:text-white">{user.email}</span>
              </div>

              <div>
                <span className="block font-sans text-[10px] font-[550] uppercase text-neutral-400">Số điện thoại</span>
                <span className="font-sans font-[550] text-neutral-700 dark:text-neutral-300">{user.phone || '—'}</span>
              </div>

              {user.gender && (
                <div>
                  <span className="block font-sans text-[10px] font-[550] uppercase text-neutral-400">Giới tính</span>
                  <span className="font-sans font-[550] text-neutral-700 dark:text-neutral-300">
                    {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender}
                  </span>
                </div>
              )}

              {user.date_of_birth && (
                <div>
                  <span className="block font-sans text-[10px] font-[550] uppercase text-neutral-400">Ngày sinh</span>
                  <span className="font-sans font-[550] text-neutral-700 dark:text-neutral-300">
                    {new Date(user.date_of_birth).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}

              <div>
                <span className="block font-sans text-[10px] font-[550] uppercase text-neutral-400">Trạng thái</span>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-sans text-[10px] font-[550] uppercase ${
                  isBlocked
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                    : isInactive
                    ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                }`}>
                  {isBlocked ? 'Đã khóa' : isInactive ? 'Không hoạt động' : 'Hoạt động'}
                </span>
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center gap-2 border-b border-neutral-100 pb-3 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
              <Icon icon="solar:map-point-bold" /> Sổ địa chỉ ({addresses.length})
            </h3>

            {addresses.length === 0 ? (
              <p className="py-2 font-normal text-xs text-neutral-400">Khách hàng chưa lưu địa chỉ nào.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-[550] text-black dark:text-white">{addr.recipient_name || addr.name}</span>
                      {addr.is_default && (
                        <span className="rounded-full bg-black px-2 py-0.5 font-sans text-[9px] font-[550] text-white dark:bg-white dark:text-black">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500">{addr.phone}</p>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {[addr.street || addr.address_detail, addr.ward, addr.district, addr.province || addr.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Orders History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="flex items-center justify-between border-b border-neutral-100 pb-3 font-sans text-xs font-[550] uppercase tracking-wider text-neutral-400 dark:border-neutral-800">
              <span className="flex items-center gap-2">
                <Icon icon="solar:bag-3-bold" /> Lịch sử đơn hàng ({orders.length})
              </span>
            </h3>

            {orders.length === 0 ? (
              <div className="py-10 text-center font-normal text-xs text-neutral-400">
                Chưa có đơn hàng nào từ khách hàng này.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {orders.map((order, idx) => {
                  const status = getOrderStatusInfo(order.status_order);
                  return (
                    <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <Link
                          href={`/admin/orders/${order.order_id}`}
                          className="font-sans text-sm font-[550] text-black hover:underline dark:text-white"
                        >
                          #{order.code_order || order.order_id}
                        </Link>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')} • {order.items_count || 1} sản phẩm
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`rounded-full border px-2.5 py-0.5 font-sans text-[10px] font-[550] uppercase ${status.className}`}>
                          {status.label}
                        </span>
                        <span className="tabular-nums font-sans text-sm font-[550] text-black dark:text-white">
                          {formatPriceVND(order.total_order || 0)}
                        </span>
                        <Link
                          href={`/admin/orders/${order.order_id}`}
                          className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white"
                        >
                          <Icon icon="solar:arrow-right-linear" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
