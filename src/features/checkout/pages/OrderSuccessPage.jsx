import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyOrderByIdApi } from '../../orders/apis/order.api';
import { useOrderPayment, useCreatePayOSPayment, usePaymentCountdown } from '../../payments/hooks/usePayment';
import { formatCountdown, parseVietQR } from '../../payments/utils/payment.utils';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { formatPriceVND } from '../../products/utils/product.utils';
import { useAuthStore } from '../../../app/store/authStore';
import { toast } from '../../../shared/utils/toast';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateOrder = location.state?.order;
  const { isAuthenticated } = useAuthStore();
  const [copiedField, setCopiedField] = useState(null);

  // 1. Fetch Order Details (Both Guest & Authenticated)
  const { data: fetchedOrder, isLoading: isOrderLoading, refetch: refetchOrder } = useQuery({
    queryKey: ['order-detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      try {
        const res = await getMyOrderByIdApi(orderId);
        return res.data?.data || res.data;
      } catch (err) {
        console.warn('Could not fetch order detail:', err);
        return null;
      }
    },
    initialData: stateOrder,
    enabled: !!orderId,
  });

  const order = fetchedOrder || stateOrder;

  // 2. Polling Payment Status (every 3s for payOS until paid)
  const {
    payment,
    isPaid,
    isPending,
    isExpired,
    isFailed,
    refetch: refetchPayment,
  } = useOrderPayment(orderId, { enabled: !!orderId });

  const createPayOSMutation = useCreatePayOSPayment();
  const remainingSeconds = usePaymentCountdown(payment?.expired_at, () => {
    refetchPayment();
    refetchOrder();
  });

  const qrDetails = parseVietQR(payment?.qr_code);
  const paymentMethod = (payment?.payment_method || order?.payment?.payment_method || 'cod').toLowerCase();
  const isPayOS = paymentMethod === 'payos';
  const effectivePaid = isPaid || order?.payment?.status_payment === 'paid';
  const isTimeExpired = Boolean(payment?.expired_at && remainingSeconds <= 0);
  const effectiveExpired = isExpired || (isTimeExpired && !effectivePaid);
  const effectivePending = (isPending || (!effectivePaid && (order?.payment?.status_payment === 'pending' || !order?.payment))) && !effectiveExpired;

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const transferContent = qrDetails?.description || `ORDER${orderId}`;
  const orderAmount = payment?.amount_payment || order?.total_order || 0;
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* 1. Top Status Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon
            icon={
              effectivePaid || !isPayOS
                ? 'solar:check-circle-bold'
                : effectiveExpired || isFailed
                  ? 'solar:danger-triangle-bold'
                  : 'solar:qr-code-bold'
            }
            className={`text-3xl sm:text-4xl shrink-0 ${
              effectivePaid || !isPayOS
                ? 'text-emerald-500'
                : effectiveExpired || isFailed
                  ? 'text-rose-500'
                  : 'text-amber-500 animate-pulse'
            }`}
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-[550] uppercase tracking-widest text-neutral-400">
                Mã đơn hàng:
              </span>
              <span className="font-mono font-[550] text-sm uppercase text-black dark:text-white">
                {order?.order_code || `#ORD-${orderId}`}
              </span>
            </div>
            <h1 className="font-sans font-[550] text-xl sm:text-2xl text-black dark:text-white uppercase tracking-tight">
              {effectivePaid
                ? 'Thanh toán thành công'
                : isPayOS
                  ? 'Đơn hàng đã chốt — Quét mã VietQR để hoàn tất'
                  : 'Đặt hàng thành công'}
            </h1>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-[550] uppercase tracking-wider text-black dark:text-white transition-all self-start sm:self-auto cursor-pointer"
        >
          <Icon icon="solar:arrow-left-linear" />
          <span>Tiếp tục mua sắm</span>
        </Link>
      </div>

      {/* 2. Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Finalized Order Details (7 cols / ~58%)                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Recipient & Shipping Information */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Icon icon="solar:map-point-bold" className="text-lg text-black dark:text-white" />
              <h2 className="font-sans font-[550] text-sm uppercase tracking-tight text-black dark:text-white">
                Thông tin giao hàng
              </h2>
            </div>

            {isOrderLoading ? (
              <div className="space-y-2">
                <LoadingSkeleton height="1.25rem" />
                <LoadingSkeleton height="1.25rem" width="60%" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-normal uppercase tracking-wider text-neutral-400">Người nhận</span>
                  <p className="font-normal text-black dark:text-white">
                    {order?.address?.receiver_name_order_address ||
                      order?.receiver_name_order_address ||
                      order?.email_order ||
                      'Khách hàng Gritmode'}
                  </p>
                  <p className="text-neutral-500 font-mono font-normal">
                    {order?.address?.phone_order_address ||
                      order?.phone_order_address ||
                      order?.phone_order ||
                      ''}
                  </p>
                  <p className="text-neutral-500 font-normal">
                    {order?.email_order || ''}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-normal uppercase tracking-wider text-neutral-400">Địa chỉ giao hàng</span>
                  <p className="text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed">
                    {[
                      order?.address?.address_line_order_address || order?.address_line_order_address,
                      order?.address?.ward_order_address || order?.ward_order_address,
                      order?.address?.district_order_address || order?.district_order_address,
                      order?.address?.province_order_address || order?.province_order_address,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Đã ghi nhận theo địa chỉ đặt hàng'}
                  </p>
                  {order?.note_order && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-normal pt-1">
                      Ghi chú: "{order.note_order}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Products List (if authenticated order with items) */}
          {items.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:t-shirt-bold-duotone" className="text-lg text-black dark:text-white" />
                  <h3 className="font-sans font-[550] text-sm uppercase tracking-tight text-black dark:text-white">
                    Sản phẩm đã đặt ({items.length})
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                {items.map((item, idx) => (
                  <div key={item.order_item_id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image_product ? (
                        <img
                          src={item.image_product}
                          alt={item.name_product_order_item || 'Product'}
                          className="w-12 h-16 object-contain rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950 p-0.5"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-neutral-400">
                          <Icon icon="solar:t-shirt-bold-duotone" className="text-xl" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-normal text-black dark:text-white uppercase truncate text-xs">
                          {item.name_product_order_item || item.name_product || 'Sản phẩm Gritmode'}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 font-normal">
                          {item.variant_order_item ? `${item.variant_order_item} · ` : ''}SL: <span className="font-[550] text-black dark:text-white">x{item.quantity_order_item || item.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-[550] text-xs text-black dark:text-white shrink-0">
                      {formatPriceVND(item.total_order_item || item.price_order_item * (item.quantity_order_item || item.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3 text-xs">
            <h3 className="font-sans font-[550] text-sm uppercase tracking-tight text-black dark:text-white pb-2 border-b border-neutral-200 dark:border-neutral-800">
              Chi tiết thanh toán
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-neutral-500 font-normal uppercase tracking-wider">
                <span>Phương thức thanh toán:</span>
                <span className="font-[550] text-black dark:text-white uppercase">
                  {isPayOS ? 'Chuyển khoản VietQR (payOS)' : 'Thanh toán khi nhận hàng (COD)'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500 font-normal uppercase tracking-wider">
                <span>Phí vận chuyển:</span>
                <span className="font-normal text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Miễn phí toàn quốc
                </span>
              </div>
              {order?.discount_order > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-normal uppercase tracking-wider">
                  <span>Mã giảm giá ({order.code_voucher_order || 'Voucher'}):</span>
                  <span className="font-[550] tracking-normal">-{formatPriceVND(order.discount_order)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-[550] text-black dark:text-white pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                <span className="uppercase tracking-wider">Tổng thanh toán:</span>
                <span className="text-lg font-sans font-[550]">{formatPriceVND(orderAmount)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PrimaryButton
              onClick={() => navigate('/products')}
              className="px-6 py-3 uppercase tracking-widest text-xs font-[550] rounded-2xl shadow-md"
            >
              Tiếp tục mua sắm
            </PrimaryButton>

            {isAuthenticated && (
              <Link
                to="/profile"
                className="px-6 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-xs font-[550] uppercase tracking-widest text-black dark:text-white transition-all text-center"
              >
                Xem đơn mua của tôi
              </Link>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Embedded VietQR Code & Payment Details (5 cols / ~42%)        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 sticky top-24">
          {isPayOS ? (
            effectivePaid ? (
              /* Case A: PayOS Paid Successfully */
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-emerald-500/30 shadow-xl text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto animate-bounce">
                  <Icon icon="solar:check-circle-bold" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Giao dịch hoàn tất
                  </span>
                  <h3 className="font-display font-black text-xl text-black dark:text-white uppercase">
                    Thanh toán thành công!
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Gritmode đã tự động xác nhận số tiền <strong className="text-black dark:text-white font-black">{formatPriceVND(orderAmount)}</strong> của đơn hàng #{orderId}. Kiện hàng đang được đóng gói chuyển đi sớm nhất.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center gap-2">
                  <Icon icon="solar:shield-check-bold" className="text-base" />
                  <span>Xác thực bởi NAPAS247 & payOS</span>
                </div>
              </div>
            ) : effectiveExpired ? (
              /* Case B: PayOS Expired */
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center text-3xl mx-auto">
                  <Icon icon="solar:clock-circle-bold" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-black text-lg text-black dark:text-white uppercase">
                    Mã thanh toán đã hết hạn
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Thời gian thanh toán cho mã QR này đã kết thúc. Bạn có thể tạo lại mã mới để hoàn tất đơn hàng.
                  </p>
                </div>
                <PrimaryButton
                  onClick={() => createPayOSMutation.mutate(orderId)}
                  isLoading={createPayOSMutation.isPending}
                  className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-lg"
                >
                  Tạo lại mã VietQR mới
                </PrimaryButton>
              </div>
            ) : (
              /* Case C: PayOS Pending - Embedded VietQR Code */
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-center space-y-5">
                
                {/* Header with Countdown */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 text-left">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                      Quét mã ngân hàng
                    </span>
                    <h3 className="font-display font-black text-base text-black dark:text-white uppercase tracking-tight">
                      Mã VietQR Chuyển khoản
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-neutral-400 block">Hết hạn sau</span>
                    <span className="font-mono font-black text-sm text-rose-600 dark:text-rose-400">
                      {formatCountdown(remainingSeconds)}
                    </span>
                  </div>
                </div>

                {/* Big Clean Scannable QR Code */}
                <div className="p-3 bg-white rounded-2xl inline-block border border-neutral-200 dark:border-neutral-700 mx-auto shadow-sm">
                  {payment?.qr_code ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(payment.qr_code)}`}
                      alt="VietQR payOS"
                      className="w-56 h-56 object-contain mx-auto rounded-xl"
                    />
                  ) : (
                    <div className="w-60 h-60 flex flex-col items-center justify-center text-neutral-400 gap-2">
                      <Icon icon="solar:qr-code-linear" className="text-5xl animate-pulse" />
                      <span className="text-xs font-bold">Đang tải mã VietQR...</span>
                    </div>
                  )}
                </div>

                {/* Complete Bank Transfer Details with 1-Click Copy Buttons */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-left">
                  {/* Bank Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Ngân hàng:</span>
                    <span className="font-bold text-black dark:text-white">
                      {qrDetails?.bank?.shortName || qrDetails?.bank?.name || 'VietQR / NAPAS247'}
                    </span>
                  </div>

                  {/* Account Number */}
                  {qrDetails?.accountNumber && (
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
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
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Chủ tài khoản:</span>
                    <span className="font-bold text-black dark:text-white uppercase">
                      GRITMODE STORE
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Số tiền:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(orderAmount, 'Số tiền')}
                      className="flex items-center gap-1.5 font-display font-black text-sm text-black dark:text-white hover:opacity-75 cursor-pointer"
                    >
                      <span>{formatPriceVND(orderAmount)}</span>
                      <Icon icon={copiedField === 'Số tiền' ? 'solar:check-read-linear' : 'solar:copy-linear'} className="text-sm text-neutral-400" />
                    </button>
                  </div>

                  {/* Transfer Content */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">Nội dung chuyển khoản:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(transferContent, 'Nội dung CK')}
                      className="flex items-center gap-1.5 font-mono font-black text-xs text-black dark:text-white bg-neutral-200 dark:bg-neutral-800 px-2.5 py-1 rounded-lg hover:opacity-80 cursor-pointer"
                    >
                      <span>{transferContent}</span>
                      <Icon icon={copiedField === 'Nội dung CK' ? 'solar:check-read-linear' : 'solar:copy-linear'} className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Live Polling Status Indicator */}
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 pt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Hệ thống tự động xác nhận ngay sau khi chuyển khoản...</span>
                </div>

                <p className="text-[10px] text-neutral-400 leading-tight">
                  Mở ứng dụng Ngân hàng (Vietcombank, MB, Techcombank, Momo, VNPay...) quét mã để thanh toán tự động không cần nhập thông tin.
                </p>
              </div>
            )
          ) : (
            /* COD Delivery Timeline Card */
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <Icon icon="solar:box-minimalistic-bold-duotone" className="text-xl text-black dark:text-white" />
                <h3 className="font-sans font-[550] text-sm uppercase tracking-tight text-black dark:text-white">
                  Tiến trình đơn hàng
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1', title: 'Tiếp nhận đơn hàng', desc: 'Gritmode đã ghi nhận đơn của bạn', active: true },
                  { step: '2', title: 'Đóng gói sản phẩm', desc: 'Kiểm tra chất lượng và đóng hộp', active: true },
                  { step: '3', title: 'Giao cho đơn vị vận chuyển', desc: 'Vận chuyển nhanh toàn quốc', active: false },
                  { step: '4', title: 'Nhận hàng & Thanh toán', desc: 'Kiểm tra hàng và thanh toán tiền mặt', active: false },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-[550] text-[10px] shrink-0 mt-0.5 ${
                      s.active
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}>
                      {s.step}
                    </div>
                    <div>
                      <h4 className={`font-normal uppercase tracking-wider ${s.active ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                        {s.title}
                      </h4>
                      <p className="text-[11px] font-normal text-neutral-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                <span className="font-normal text-black dark:text-white block">💡 Lưu ý khi nhận hàng:</span>
                <p className="text-[11px] font-normal leading-relaxed">
                  Bạn được mở gói hàng kiểm tra đúng mẫu mã, kích cỡ trước khi thanh toán tiền mặt cho bưu tá.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
