import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import {
  getOrderStatusInfo,
  getPaymentStatusInfo,
  getAllowedAdminOrderActions,
} from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import { useAdminOrderDetail } from '../hooks/useAdmin';

export default function OrderDetailModal({
  order,
  onClose,
  onConfirm,
  onProcess,
  onShip,
  onComplete,
  onCancel,
  onCompleteRefund,
  isActionPending = false,
}) {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReasonError, setCancelReasonError] = useState('');
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  const orderId = order?.order_id || order?.id;
  const {
    data: fullDetail,
    isPending: loadingDetail,
    isError: detailError,
    refetch: refetchDetail,
  } = useAdminOrderDetail(orderId);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!order) return undefined;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    lastActiveElementRef.current = document.activeElement;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), [href], select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
      lastActiveElementRef.current?.focus?.();
    };
  }, [onClose, order]);

  if (!order) return null;

  const activeOrder = fullDetail ? { ...order, ...fullDetail } : order;

  const orderStatus = getOrderStatusInfo(activeOrder.status_order);
  const paymentMethod = activeOrder.payment_method || activeOrder.payment?.payment_method || 'cod';
  const rawPaymentStatus = activeOrder.status_payment || activeOrder.payment?.status_payment;
  const paymentStatus = getPaymentStatusInfo(rawPaymentStatus, paymentMethod);
  const allowedActions = getAllowedAdminOrderActions(
    activeOrder.status_order,
    paymentMethod,
    rawPaymentStatus
  );
  const refundRequest = activeOrder.refund_request;
  const refundRequestStatus = String(refundRequest?.status_refund_request || activeOrder.refund_status || '').toLowerCase();
  const canCompleteRefund = ['pending', 'processing'].includes(refundRequestStatus);

  const address = activeOrder.address || {};
  const items = Array.isArray(activeOrder.items) ? activeOrder.items : [];

  const handleCancelSubmit = () => {
    const reason = cancelReason.trim();

    if (!reason) {
      setCancelReasonError('Vui lòng nhập lý do hủy đơn.');
      return;
    }

    onCancel({ orderId, reason });
    setShowCancelInput(false);
    setCancelReason('');
    setCancelReasonError('');
  };

  const handleCompleteRefund = () => {
    if (!onCompleteRefund || !refundRequest?.refund_request_id) return;

    const providerReference = window.prompt(
      'Mã giao dịch hoàn tiền (nếu có, có thể để trống):',
      refundRequest.provider_reference || '',
    );
    if (providerReference === null) return;

    const adminNote = window.prompt('Ghi chú xử lý hoàn tiền (không bắt buộc):', refundRequest.admin_note || '') || '';
    onCompleteRefund({
      refundRequestId: refundRequest.refund_request_id,
      providerReference: providerReference.trim(),
      adminNote: adminNote.trim(),
    });
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-detail-title"
        data-lenis-prevent
        ref={dialogRef}
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xl overflow-hidden overscroll-contain scrollbar-none p-7 sm:p-8 space-y-5 max-h-[92dvh] overflow-y-auto font-sans font-[550]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-[550] uppercase tracking-widest text-neutral-500 block">
              CHI TIẾT ĐƠN HÀNG ADMIN
            </span>
            <h3 id="admin-order-detail-title" className="font-sans font-[550] text-xl text-black dark:text-white uppercase mt-0.5 tracking-tight">
              {activeOrder.order_code || activeOrder.code_order || `#ORD-${orderId}`}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Đặt lúc: {new Date(activeOrder.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} {new Date(activeOrder.created_at || Date.now()).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            aria-label="Đóng chi tiết đơn hàng"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-black dark:hover:bg-neutral-800 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 text-xl transition-colors cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-[550] text-neutral-500 uppercase tracking-wider block mb-1">
              TRẠNG THÁI ĐƠN HÀNG
            </span>
            <span className={`inline-block text-[11px] font-[550] uppercase px-3 py-0.5 rounded-full border ${orderStatus.color || 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {orderStatus.label}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
            <span className="text-[11px] font-[550] text-neutral-500 uppercase tracking-wider block mb-1">
              THANH TOÁN
            </span>
            <span className={`inline-block text-[11px] font-[550] uppercase px-3 py-0.5 rounded-full border ${paymentStatus.color || 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {paymentMethod.toUpperCase()} • {paymentStatus.label}
            </span>
          </div>
        </div>

        {refundRequest && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs dark:border-amber-900/60 dark:bg-amber-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-[550] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  YÊU CẦU HOÀN TIỀN
                </p>
                <p className="mt-1 text-amber-700/80 dark:text-amber-300/80">
                  {refundRequestStatus === 'completed'
                    ? 'Đã ghi nhận hoàn tiền cho khách hàng.'
                    : 'Đã hủy đơn. Hãy hoàn tiền qua kênh thanh toán phù hợp rồi xác nhận tại đây.'}
                </p>
              </div>
              {canCompleteRefund && onCompleteRefund && (
                <button
                  type="button"
                  onClick={handleCompleteRefund}
                  disabled={isActionPending}
                  className="shrink-0 rounded-full bg-amber-600 px-3.5 py-1.5 text-[11px] font-[550] uppercase tracking-wider text-white transition-colors hover:bg-amber-700 disabled:opacity-40"
                >
                  Xác nhận đã hoàn
                </button>
              )}
            </div>
            {refundRequest.reason && (
              <p className="mt-2 text-amber-700/80 dark:text-amber-300/80">
                Lý do: {refundRequest.reason}
              </p>
            )}
          </div>
        )}

        {/* Customer & Shipping Info Box */}
        <div className="p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="font-[550] uppercase tracking-wider text-neutral-500 text-[11px] block mb-1">
              NGƯỜI NHẬN & LIÊN HỆ
            </span>
            <p className="font-[550] text-sm text-black dark:text-white">
              {address.receiver_name_order_address || activeOrder.receiver_name_order_address || activeOrder.shipping_name || activeOrder.user_name || 'Khách hàng'}
            </p>
            <p className="text-neutral-500 font-sans font-[550] text-xs">
              {address.phone_order_address || activeOrder.phone_order_address || activeOrder.phone_order || activeOrder.shipping_phone || '—'}
            </p>
            <p className="text-neutral-500 text-xs">
              {activeOrder.email_order || activeOrder.shipping_email || activeOrder.user_email || '—'}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="font-[550] uppercase tracking-wider text-neutral-500 text-[11px] block mb-1">
              ĐỊA CHỈ GIAO HÀNG
            </span>
            {loadingDetail ? (
              <p className="text-neutral-500 italic text-xs">Đang tải địa chỉ...</p>
            ) : detailError ? (
              <div className="flex items-center justify-between gap-3 text-xs text-rose-600">
                <span>Không thể tải địa chỉ.</span>
                <button
                  type="button"
                  onClick={() => refetchDetail()}
                  className="font-[550] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-xs">
                {activeOrder.shipping_address_detail || [
                  address.address_line_order_address || address.street || address.address_detail,
                  address.ward_order_address || address.ward,
                  address.district_order_address || address.district,
                  address.province_order_address || address.province || address.city,
                ].filter(Boolean).join(', ') || 'Chưa cung cấp'}
              </p>
            )}
            {activeOrder.note_order && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-[550] pt-1 italic">
                Ghi chú: "{activeOrder.note_order}"
              </p>
            )}
          </div>
        </div>

        {/* Products Snapshot */}
        <div className="space-y-2.5">
          <h4 className="font-[550] uppercase tracking-wider text-neutral-500 text-[11px]">
            SẢN PHẨM TRONG ĐƠN ({items.length})
          </h4>

          {loadingDetail ? (
            <div className="py-4 text-center text-neutral-500 text-xs italic">
              Đang tải danh sách sản phẩm...
            </div>
          ) : detailError ? (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
              <span>Không thể tải chi tiết sản phẩm.</span>
              <button
                type="button"
                onClick={() => refetchDetail()}
                className="font-[550] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              >
                Thử lại
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-neutral-500 text-xs">
              Không có thông tin chi tiết sản phẩm.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((item, idx) => {
                const optValues = item.variant_order_item || (typeof item.option_values === 'object' && item.option_values
                  ? Object.values(item.option_values).map((v) => `${v}`).join(' / ')
                  : item.option_values || item.variant_title || '');
                const itemPrice = Number(item.price_order_item ?? item.price ?? item.unit_price ?? 0);
                const originalItemPrice = Number(item.original_price_order_item ?? item.original_price ?? itemPrice);
                const itemQty = Number(item.quantity_order_item ?? item.quantity ?? 1);
                const itemTotal = Number(item.total_order_item || (itemPrice * itemQty));
                const originalItemTotal = originalItemPrice * itemQty;
                const isOnSale = originalItemPrice > itemPrice;
                const sku = item.sku_order_item || item.sku || '';

                return (
                  <div key={item.order_item_id || idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h5 className="flex flex-wrap items-center gap-2 font-[550] text-black dark:text-white uppercase text-sm">
                        <span className="min-w-0 break-words">
                          {item.name_product_order_item || item.name_product || item.title || 'SẢN PHẨM'}
                        </span>
                        {isOnSale && (
                          <span className="shrink-0 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-[550] tracking-wider text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                            SALE
                          </span>
                        )}
                      </h5>
                      <p className="text-neutral-500 text-xs uppercase font-sans font-[550] mt-0.5 break-words">
                        {sku ? `SKU: ${sku} • ` : ''}{optValues ? `${optValues} • ` : ''}SL: X{itemQty}
                      </p>
                    </div>
                    <span className="flex shrink-0 flex-col items-end gap-0.5 text-xs tabular-nums">
                      {isOnSale && (
                        <span className="text-[10px] font-[550] text-neutral-400 line-through">
                          {formatPriceVND(originalItemTotal)}
                        </span>
                      )}
                      <span className={`font-[550] ${isOnSale ? 'text-rose-600 dark:text-rose-300' : 'text-black dark:text-white'}`}>
                        {formatPriceVND(itemTotal)}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-xs">
          <div className="flex justify-between text-neutral-500">
            <span>Tạm tính:</span>
              <span className="font-[550] text-black dark:text-white tabular-nums">
              {formatPriceVND(activeOrder.subtotal_order || activeOrder.total_order || 0)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phí giao hàng:</span>
              <span className="font-[550] text-black dark:text-white tabular-nums">
              {formatPriceVND(activeOrder.shipping_fee_order || activeOrder.shipping_fee || 0)}
            </span>
          </div>
          {Number(activeOrder.discount_order || activeOrder.discount_amount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-[550]">
              <span>Giảm giá ({activeOrder.code_voucher_order || 'Voucher'}):</span>
              <span className="tabular-nums">-{formatPriceVND(activeOrder.discount_order || activeOrder.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-[550] text-sm text-black dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="uppercase tracking-wider">TỔNG THANH TOÁN:</span>
            <span className="text-sm font-[550] tabular-nums">
              {formatPriceVND(activeOrder.total_order || 0)}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2">
          {showCancelInput ? (
            <div className="space-y-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs">
              <label className="font-[550] text-rose-600 dark:text-rose-400 block">Lý do hủy đơn hàng:</label>
              <input
                type="text"
                required
                aria-invalid={Boolean(cancelReasonError)}
                aria-describedby={cancelReasonError ? 'cancel-reason-error' : undefined}
                placeholder="Nhập lý do hủy (VD: Khách yêu cầu, hết hàng lưu kho...)"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelReasonError) setCancelReasonError('');
                }}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              />
              {cancelReasonError && (
                <p id="cancel-reason-error" role="alert" className="text-xs text-rose-600 dark:text-rose-400">
                  {cancelReasonError}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelInput(false)}
                  className="px-4 py-1.5 rounded-full border border-neutral-300 text-neutral-600 font-[550] text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={isActionPending}
                  className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-[550] uppercase tracking-wider text-xs hover:bg-rose-700 cursor-pointer"
                >
                  Xác nhận hủy đơn
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {/* Left Action: Hủy đơn */}
              <div>
                {allowedActions.includes('cancel') && (
                  <button
                    type="button"
                    onClick={() => setShowCancelInput(true)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-transparent text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    HỦY ĐƠN
                  </button>
                )}
              </div>

              {/* Right Actions: Workflow action button + ĐÓNG */}
              <div className="flex items-center gap-2">
                {allowedActions.includes('confirm') && (
                  <button
                    type="button"
                    onClick={() => onConfirm(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    Xác nhận đơn
                  </button>
                )}
                {allowedActions.includes('processing') && (
                  <button
                    type="button"
                    onClick={() => onProcess(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    Chuẩn bị hàng
                  </button>
                )}
                {allowedActions.includes('shipping') && (
                  <button
                    type="button"
                    onClick={() => onShip(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    Giao hàng
                  </button>
                )}
                {allowedActions.includes('complete') && (
                  <button
                    type="button"
                    onClick={() => onComplete(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-[550] uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                  >
                    Hoàn tất
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full border border-neutral-300 bg-white text-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white text-xs font-[550] uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  ĐÓNG
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
