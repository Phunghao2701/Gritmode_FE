import React from 'react';
import Icon from '../../../shared/components/Icon';

export default function UserDetailModal({
  user,
  onClose,
  onBlock,
  onUnblock,
  onSetInactive,
  isActionPending = false,
  currentAdminId,
}) {
  if (!user) return null;

  const isSelf = user.user_id === currentAdminId;
  const isBlocked = user.status === 'blocked';
  const isInactive = user.status === 'inactive';
  const isActive = user.status === 'active';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-black text-sm text-black dark:text-white shrink-0">
              {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Chi tiết tài khoản
              </span>
              <h3 className="font-display font-black text-lg text-black dark:text-white line-clamp-1">
                {user.full_name || 'Khách hàng chưa đặt tên'}
              </h3>
              <p className="text-neutral-500 text-xs font-mono">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* User Info Details */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Vai trò</span>
            <p className="font-black text-black dark:text-white mt-0.5 uppercase tracking-wider">
              {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Trạng thái</span>
            <div className="mt-0.5">
              {isActive && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                  Hoạt động
                </span>
              )}
              {isInactive && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
                  Không hoạt động
                </span>
              )}
              {isBlocked && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  Đã bị khóa
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Số điện thoại</span>
            <p className="font-mono text-black dark:text-white mt-0.5">{user.phone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400">Xác thực Email</span>
            <p className="text-black dark:text-white mt-0.5">
              {user.email_verified_at ? 'Đã xác thực OTP' : 'Chưa xác thực'}
            </p>
          </div>
          <div className="col-span-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-400 flex justify-between">
            <span>Ngày đăng ký: {new Date(user.created_at || Date.now()).toLocaleDateString('vi-VN')}</span>
            <span className="font-mono text-[10px]">ID: {user.user_id}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            {!isSelf && (
              <>
                {isBlocked ? (
                  <button
                    type="button"
                    onClick={() => onUnblock(user.user_id)}
                    disabled={isActionPending}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Mở khóa tài khoản
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onBlock(user.user_id)}
                    disabled={isActionPending}
                    className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Khóa tài khoản
                  </button>
                )}

                {isActive && (
                  <button
                    type="button"
                    onClick={() => onSetInactive(user.user_id)}
                    disabled={isActionPending}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Vô hiệu hóa
                  </button>
                )}
              </>
            )}
            {isSelf && (
              <span className="text-[11px] text-neutral-400 italic">
                (Tài khoản quản trị viên của bạn)
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-85 cursor-pointer shadow-md ml-auto"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
