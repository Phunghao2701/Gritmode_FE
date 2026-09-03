import { useParams, Link } from 'react-router-dom';
import { useAdminUserDetail, useAdminUsers } from '../hooks/useAdmin';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { formatPriceVND } from '../../products/utils/product.utils';
import { getOrderStatusInfo } from '../../orders/utils/order.utils';

export default function AdminUserDetailPage() {
  const { userId } = useParams();

  const { data: user, isLoading } = useAdminUserDetail(userId);
  const {
    blockUser,
    unblockUser,
    setUserInactive,
    isUserActionPending,
  } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LoadingSkeleton className="h-96 rounded-3xl" />
          <LoadingSkeleton className="h-96 lg:col-span-2 rounded-3xl" />
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
        <h2 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">
          Không tìm thấy người dùng
        </h2>
        <p className="text-xs text-neutral-400">
          Người dùng #{userId} không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-wider"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const orders = Array.isArray(user.orders) ? user.orders : [];

  const isBlocked = user.status_user === 'blocked' || user.is_blocked;
  const isInactive = user.status_user === 'inactive';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-2"
          >
            <Icon icon="solar:arrow-left-linear" /> Quay lại danh sách khách hàng
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white">
              {user.name_user || user.name || 'Người dùng'}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                user.role_user === 'admin'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900'
              }`}
            >
              {user.role_user === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}
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
              className="px-4 py-2 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
            >
              Khóa tài khoản
            </button>
          )}

          {!isInactive && (
            <button
              type="button"
              disabled={isUserActionPending}
              onClick={() => setUserInactive(user.user_id || user.id)}
              className="px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Icon icon="solar:user-id-bold" /> Hồ sơ người dùng
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Email</span>
                <span className="font-bold text-black dark:text-white">{user.email}</span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Số điện thoại</span>
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{user.phone || '—'}</span>
              </div>

              <div>
                <span className="text-neutral-400 block text-[10px] font-bold uppercase">Trạng thái</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Icon icon="solar:map-point-bold" /> Sổ địa chỉ ({addresses.length})
            </h3>

            {addresses.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">Khách hàng chưa lưu địa chỉ nào.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black dark:text-white">{addr.recipient_name || addr.name}</span>
                      {addr.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-black text-white dark:bg-white dark:text-black">
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
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon icon="solar:bag-3-bold" /> Lịch sử đơn hàng ({orders.length})
              </span>
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-10 text-neutral-400 text-xs">
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
                          to={`/admin/orders/${order.order_id}`}
                          className="font-bold text-sm text-black dark:text-white hover:underline"
                        >
                          #{order.code_order || order.order_id}
                        </Link>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')} • {order.items_count || 1} sản phẩm
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${status.className}`}>
                          {status.label}
                        </span>
                        <span className="font-black text-sm text-black dark:text-white tabular-nums">
                          {formatPriceVND(order.total_order || 0)}
                        </span>
                        <Link
                          to={`/admin/orders/${order.order_id}`}
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
