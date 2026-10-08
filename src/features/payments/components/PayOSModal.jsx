import React from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useOrderPayment, useCreatePayOSPayment, usePaymentCountdown } from '../hooks/usePayment';
import PayOSPaymentCard from './PayOSPaymentCard';

export default function PayOSModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
  guestInfo,
}) {
  const { payment, isPaid, isExpired, isFailed, refetch } = useOrderPayment(
    orderId,
    { enabled: isOpen, guestInfo }
  );

  const createPayOSMutation = useCreatePayOSPayment();
  const remainingSeconds = usePaymentCountdown(payment?.expired_at, () => {
    refetch();
  });

  if (!isOpen || !payment) return null;

  const handleRetryPayment = () => {
    createPayOSMutation.mutate({ orderId, guestInfo });
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-left">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Thanh toán trực tuyến
            </span>
            <h3 className="font-display font-black text-lg text-black dark:text-white uppercase tracking-tight">
              Thanh toán qua VIETQR
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-full text-2xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* State 1: Paid Successfully */}
        {isPaid ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto animate-bounce">
              <Icon icon="solar:check-circle-bold" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-xl text-black dark:text-white uppercase">
                Thanh toán thành công!
              </h4>
              <p className="text-xs text-neutral-500">
                Gritmode đã xác nhận khoản chuyển khoản của bạn cho đơn hàng #{orderId}.
              </p>
            </div>
            <PrimaryButton
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-lg"
            >
              Xem chi tiết đơn hàng
            </PrimaryButton>
          </div>
        ) : isExpired ? (
          /* State 2: Expired */
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto">
              <Icon icon="solar:clock-circle-bold" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-lg text-black dark:text-white uppercase">
                Liên kết thanh toán đã hết hạn
              </h4>
              <p className="text-xs text-neutral-500">
                Liên kết thanh toán VIETQR đã hết hạn. Bạn có thể tạo liên kết mới để tiếp tục.
              </p>
            </div>
            <PrimaryButton
              onClick={handleRetryPayment}
              isLoading={createPayOSMutation.isPending}
              className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-lg"
            >
              Tạo lại liên kết VIETQR
            </PrimaryButton>
          </div>
        ) : isFailed ? (
          /* State 3: Failed */
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-3xl mx-auto">
              <Icon icon="solar:close-circle-bold" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-black text-lg text-black dark:text-white uppercase">
                Thanh toán không thành công
              </h4>
              <p className="text-xs text-neutral-500">
                Có lỗi xảy ra trong quá trình xử lý giao dịch. Vui lòng thử lại.
              </p>
            </div>
            <PrimaryButton
              onClick={handleRetryPayment}
              isLoading={createPayOSMutation.isPending}
              className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-lg"
            >
              Thử thanh toán lại
            </PrimaryButton>
          </div>
        ) : (
  /* State 4: Pending / VIETQR */
          <div className="space-y-4">
            <PayOSPaymentCard
              payment={payment}
              remainingSeconds={remainingSeconds}
            />
          </div>
        )}

      </div>
    </div>
  );
}
