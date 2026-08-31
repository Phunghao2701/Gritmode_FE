import React from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useOrderPayment, useCreatePayOSPayment, usePaymentCountdown } from '../hooks/usePayment';
import { formatCountdown } from '../utils/payment.utils';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function PayOSModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { payment, isPaid, isExpired, isFailed, isPending, refetch } = useOrderPayment(
    orderId,
    { enabled: isOpen }
  );

  const createPayOSMutation = useCreatePayOSPayment();
  const remainingSeconds = usePaymentCountdown(payment?.expired_at, () => {
    refetch();
  });

  if (!isOpen || !payment) return null;

  const handleRetryPayment = () => {
    createPayOSMutation.mutate(orderId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 text-left">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              Thanh toán trực tuyến
            </span>
            <h3 className="font-display font-black text-lg text-black dark:text-white uppercase">
              Cổng thanh toán payOS
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
              Hoàn tất
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
                Mã thanh toán đã hết hạn
              </h4>
              <p className="text-xs text-neutral-500">
                Thời gian 15 phút thanh toán cho mã QR này đã kết thúc. Bạn có thể tạo lại mã mới để tiếp tục.
              </p>
            </div>
            <PrimaryButton
              onClick={handleRetryPayment}
              isLoading={createPayOSMutation.isPending}
              className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-lg"
            >
              Tạo lại mã thanh toán
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
          /* State 4: Pending / Scanning QR */
          <div className="space-y-5">
            {/* Amount & Countdown */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Số tiền</span>
                <p className="font-display font-black text-sm text-black dark:text-white">
                  {formatPriceVND(payment.amount_payment)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Thời gian còn lại</span>
                <p className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                  {formatCountdown(remainingSeconds)}
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl inline-block shadow-inner mx-auto">
              {payment.qr_code ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payment.qr_code)}`}
                  alt="VietQR payOS"
                  className="w-52 h-52 object-contain mx-auto rounded-xl"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-neutral-400">
                  <Icon icon="solar:qr-code-linear" className="text-5xl" />
                </div>
              )}
            </div>

            <p className="text-[11px] text-neutral-500">
              Mở ứng dụng Ngân hàng và quét mã VietQR trên để thanh toán tức thì.
            </p>

            {/* Direct Link button */}
            {payment.checkout_url && (
              <a
                href={payment.checkout_url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-neutral-200 dark:border-neutral-800 text-xs font-black uppercase tracking-wider text-black dark:text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Mở trang thanh toán payOS</span>
                <Icon icon="solar:arrow-right-up-linear" />
              </a>
            )}

            {/* Live Polling Status */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Đang chờ nhận xác nhận chuyển khoản tự động...</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
