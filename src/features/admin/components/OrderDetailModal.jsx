import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../../../shared/components/Icon';
import {
  getOrderStatusInfo,
  getPaymentStatusInfo,
  getAllowedAdminOrderActions,
} from '../../orders/utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';
import { getAdminOrderByIdApi } from '../apis/admin.api';

export default function OrderDetailModal({
  order,
  onClose,
  onConfirm,
  onProcess,
  onShip,
  onComplete,
  onCancel,
  isActionPending = false,
}) {
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [fullDetail, setFullDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const orderId = order?.order_id || order?.id;

  // Lock body scroll when modal is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (orderId) {
      setLoadingDetail(true);
      getAdminOrderByIdApi(orderId)
        .then((res) => {
          if (isMounted) {
            setFullDetail(res.data?.data || res.data);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch full admin order details:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingDetail(false);
        });
    }
    return () => { isMounted = false; };
  }, [orderId]);

  if (!order) return null;

  const activeOrder = fullDetail || order;

  const orderStatus = getOrderStatusInfo(activeOrder.status_order);
  const paymentMethod = activeOrder.payment_method || activeOrder.payment?.payment_method || 'cod';
  const rawPaymentStatus = activeOrder.status_payment || activeOrder.payment?.status_payment;
  const paymentStatus = getPaymentStatusInfo(rawPaymentStatus, paymentMethod);
  const allowedActions = getAllowedAdminOrderActions(
    activeOrder.status_order,
    paymentMethod,
    rawPaymentStatus
  );

  const address = activeOrder.address || {};
  const items = Array.isArray(activeOrder.items) ? activeOrder.items : [];

  const handleCancelSubmit = () => {
    onCancel({ orderId, reason: cancelReason.trim() });
    setShowCancelInput(false);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-[28px] bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl overflow-hidden p-7 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              CHI TIẾT ĐƠN HÀNG ADMIN
            </span>
            <h3 className="font-mono font-bold text-xl text-black dark:text-white uppercase mt-0.5 tracking-tight">
              {activeOrder.order_code || activeOrder.code_order || `#ORD-${orderId}`}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Đặt lúc: {new Date(activeOrder.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} {new Date(activeOrder.created_at || Date.now()).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-black dark:hover:text-white text-xl transition-colors cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100/80 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              TRẠNG THÁI ĐƠN HÀNG
            </span>
            <span className={`inline-block text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border ${orderStatus.color || 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {orderStatus.label}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100/80 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              THANH TOÁN
            </span>
            <span className={`inline-block text-[10px] font-bold uppercase px-3 py-0.5 rounded-full border ${paymentStatus.color || 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              {paymentMethod.toUpperCase()} • {paymentStatus.label}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Info Box */}
        <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-100/80 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] block mb-1">
              NGƯỜI NHẬN & LIÊN HỆ
            </span>
            <p className="font-bold text-xs text-black dark:text-white">
              {address.receiver_name_order_address || activeOrder.receiver_name_order_address || activeOrder.shipping_name || activeOrder.user_name || 'Khách hàng'}
            </p>
            <p className="text-neutral-500 font-mono text-[11px]">
              {address.phone_order_address || activeOrder.phone_order_address || activeOrder.phone_order || activeOrder.shipping_phone || '—'}
            </p>
            <p className="text-neutral-500 text-[11px]">
              {activeOrder.email_order || activeOrder.shipping_email || activeOrder.user_email || '—'}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px] block mb-1">
              ĐỊA CHỈ GIAO HÀNG
            </span>
            {loadingDetail ? (
              <p className="text-neutral-400 italic text-[11px]">Đang tải địa chỉ...</p>
            ) : (
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">
                {activeOrder.shipping_address_detail || [
                  address.address_line_order_address || address.street || address.address_detail,
                  address.ward_order_address || address.ward,
                  address.district_order_address || address.district,
                  address.province_order_address || address.province || address.city,
                ].filter(Boolean).join(', ') || 'Chưa cung cấp'}
              </p>
            )}
            {activeOrder.note_order && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold pt-1 italic">
                Ghi chú: "{activeOrder.note_order}"
              </p>
            )}
          </div>
        </div>

        {/* Products Snapshot */}
        <div className="space-y-2.5">
          <h4 className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">
            SẢN PHẨM TRONG ĐƠN ({items.length})
          </h4>

          {loadingDetail ? (
            <div className="py-4 text-center text-neutral-400 text-xs italic">
              Đang tải danh sách sản phẩm...
            </div>
          ) : items.length === 0 ? (
            <div className="py-4 text-center text-neutral-400 text-xs">
              Không có thông tin chi tiết sản phẩm.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((item, idx) => {
                const optValues = item.variant_order_item || (typeof item.option_values === 'object' && item.option_values
                  ? Object.values(item.option_values).map((v) => `${v}`).join(' / ')
                  : item.option_values || item.variant_title || '');
                const itemPrice = Number(item.price_order_item ?? item.price ?? item.unit_price ?? 0);
                const itemQty = Number(item.quantity_order_item ?? item.quantity ?? 1);
                const itemTotal = Number(item.total_order_item || (itemPrice * itemQty));
                const sku = item.sku_order_item || item.sku || '';

                return (
                  <div key={item.order_item_id || idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h5 className="font-bold text-black dark:text-white uppercase text-xs">
                        {item.name_product_order_item || item.name_product || item.title || 'SẢN PHẨM'}
                      </h5>
                      <p className="text-neutral-400 text-[10px] uppercase font-mono mt-0.5">
                        {sku ? `SKU: ${sku} • ` : ''}{optValues ? `${optValues} • ` : ''}SL: X{itemQty}
                      </p>
                    </div>
                    <span className="font-bold text-black dark:text-white shrink-0 text-xs tabular-nums">
                      {formatPriceVND(itemTotal)}
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
            <span className="font-medium text-black dark:text-white tabular-nums">
              {formatPriceVND(activeOrder.subtotal_order || activeOrder.total_order || 0)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phí giao hàng:</span>
            <span className="font-medium text-black dark:text-white tabular-nums">
              {formatPriceVND(activeOrder.shipping_fee_order || activeOrder.shipping_fee || 0)}
            </span>
          </div>
          {Number(activeOrder.discount_order || activeOrder.discount_amount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Giảm giá ({activeOrder.code_voucher_order || 'Voucher'}):</span>
              <span className="tabular-nums">-{formatPriceVND(activeOrder.discount_order || activeOrder.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-black dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="uppercase tracking-wider">TỔNG THANH TOÁN:</span>
            <span className="text-sm font-bold tabular-nums">
              {formatPriceVND(activeOrder.total_order || 0)}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2">
          {showCancelInput ? (
            <div className="space-y-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs">
              <label className="font-bold text-rose-600 dark:text-rose-400 block">Lý do hủy đơn hàng:</label>
              <input
                type="text"
                placeholder="Nhập lý do hủy (VD: Khách yêu cầu, hết hàng lưu kho...)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCancelInput(false)}
                  className="px-4 py-1.5 rounded-full border border-neutral-300 text-neutral-600 font-bold text-xs cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={isActionPending}
                  className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold uppercase tracking-wider text-xs hover:bg-rose-700 cursor-pointer"
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
                    className="px-4 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-transparent text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
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
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    Xác nhận đơn
                  </button>
                )}
                {allowedActions.includes('processing') && (
                  <button
                    type="button"
                    onClick={() => onProcess(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    Chuẩn bị hàng
                  </button>
                )}
                {allowedActions.includes('shipping') && (
                  <button
                    type="button"
                    onClick={() => onShip(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    Giao hàng
                  </button>
                )}
                {allowedActions.includes('complete') && (
                  <button
                    type="button"
                    onClick={() => onComplete(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm disabled:opacity-40"
                  >
                    Hoàn tất
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
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
