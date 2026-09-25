import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useOrderPayment, useCreatePayOSPayment, usePaymentCountdown } from '../hooks/usePayment';
import { formatCountdown, parseVietQR } from '../utils/payment.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import { toast } from '../../../shared/utils/toast';

export default function PayOSModal({
  orderId,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [copiedField, setCopiedField] = useState(null);

  const { payment, isPaid, isExpired, isFailed, refetch } = useOrderPayment(
    orderId,
    { enabled: isOpen }
  );

  const createPayOSMutation = useCreatePayOSPayment();
  const remainingSeconds = usePaymentCountdown(payment?.expired_at, () => {
    refetch();
  });

  const qrDetails = parseVietQR(payment?.qr_code);

  if (!isOpen || !payment) return null;

  const handleRetryPayment = () => {
    createPayOSMutation.mutate(orderId);
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const transferContent = qrDetails?.description || `ORDER${orderId}`;
  const amount = payment.amount_payment || qrDetails?.amount || 0;

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
              Quét mã VietQR Chuyển khoản
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
          /* State 4: Pending / On-Site Scanning QR */
          <div className="space-y-4">
            
            {/* Amount & Countdown Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Số tiền cần thanh toán</span>
                <p className="font-display font-black text-base text-black dark:text-white">
                  {formatPriceVND(amount)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-neutral-400">Hết hạn sau</span>
                <p className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                  {formatCountdown(remainingSeconds)}
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3 bg-white dark:bg-white rounded-3xl inline-block shadow-lg mx-auto border-2 border-neutral-200">
              {payment.qr_code ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=4&data=${encodeURIComponent(payment.qr_code)}`}
                  alt="VietQR payOS"
                  className="w-56 h-56 object-contain mx-auto rounded-xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-neutral-400">
                  <Icon icon="solar:qr-code-linear" className="text-5xl animate-pulse" />
                </div>
              )}
            </div>

            {/* Complete Bank Transfer Details with 1-Click Copy */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-xs text-left">
              {/* Bank Name */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Ngân hàng:</span>
                <span className="font-bold text-black dark:text-white">
                  {qrDetails?.bank?.shortName || qrDetails?.bank?.name || 'VietQR / NAPAS247'}
                </span>
              </div>

              {/* Account Number */}
              {qrDetails?.accountNumber && (
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Số tài khoản:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(qrDetails.accountNumber, 'Số tài khoản')}
                    className="flex items-center gap-1.5 font-mono font-black text-xs text-black dark:text-white bg-neutral-200/70 dark:bg-neutral-800 px-2 py-0.5 rounded-md hover:opacity-80 cursor-pointer"
                  >
                    <span>{qrDetails.accountNumber}</span>
                    <Icon icon={copiedField === 'Số tài khoản' ? 'solar:check-read-linear' : 'solar:copy-linear'} className="text-sm" />
                  </button>
                </div>
              )}

              {/* Account Name */}
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Chủ tài khoản:</span>
                <span className="font-bold text-black dark:text-white uppercase">
                  GRITMODE STORE
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Số tiền:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(amount, 'Số tiền')}
                  className="flex items-center gap-1.5 font-display font-black text-sm text-black dark:text-white hover:opacity-75 cursor-pointer"
                >
                  <span>{formatPriceVND(amount)}</span>
                  <Icon icon={copiedField === 'Số tiền' ? 'solar:check-read-linear' : 'solar:copy-linear'} className="text-sm text-neutral-400" />
                </button>
              </div>

              {/* Transfer Content */}
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-200/60 dark:border-neutral-800">
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Nội dung chuyển khoản:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferContent, 'Nội dung CK')}
                  className="flex items-center gap-1.5 font-mono font-black text-xs text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 px-2.5 py-0.5 rounded-lg hover:opacity-80 cursor-pointer"
                >
                  <span>{transferContent}</span>
                  <Icon icon={copiedField === 'Nội dung CK' ? 'solar:check-read-linear' : 'solar:copy-linear'} className="text-sm" />
                </button>
              </div>
            </div>

            {/* Live Polling Status */}
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Hệ thống tự động kích hoạt ngay khi nhận được tiền...</span>
            </div>

            <p className="text-[10px] text-neutral-400">
              Quét mã bằng ứng dụng Ngân hàng (VCB, MBBank, Techcombank, Momo, VNPay...) để thanh toán tự động không cần nhập thông tin.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
