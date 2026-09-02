import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
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
  const isGuest = !activeOrder.user && !activeOrder.user_id;

  const handleCancelSubmit = () => {
    onCancel({ orderId, reason: cancelReason.trim() });
    setShowCancelInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Chi tiết đơn hàng Admin
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {isGuest ? 'Khách vãng lai' : 'Khách đã đăng ký'}
              </span>
            </div>
            <h3 className="font-mono font-black text-xl text-black dark:text-white uppercase mt-0.5">
              {activeOrder.order_code || `#ORD-${orderId}`}
            </h3>
            <p className="text-[11px] text-neutral-500">
              Đặt lúc: {new Date(activeOrder.created_at || Date.now()).toLocaleString('vi-VN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Trạng thái đơn hàng</span>
            <div className="mt-1">
              <span className={`inline-block text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                {orderStatus.label}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Thanh toán</span>
            <div className="mt-1">
              <span className={`inline-block text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${paymentStatus.color}`}>
                {paymentMethod.toUpperCase()} • {paymentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Người nhận & Liên hệ</span>
            <p className="font-black text-black dark:text-white">
              {address.receiver_name_order_address || activeOrder.receiver_name_order_address || activeOrder.email_order}
            </p>
            <p className="text-neutral-500 font-mono">{address.phone_order_address || activeOrder.phone_order_address || activeOrder.phone_order}</p>
            <p className="text-neutral-500">{activeOrder.email_order}</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-neutral-400 text-[10px]">Địa chỉ giao hàng</span>
            {loadingDetail ? (
              <p className="text-neutral-400 italic">Đang tải địa chỉ...</p>
            ) : (
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {[
                  address.address_line_order_address || activeOrder.address_line_order_address,
                  address.ward_order_address || activeOrder.ward_order_address,
                  address.district_order_address || activeOrder.district_order_address,
                  address.province_order_address || activeOrder.province_order_address,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Chưa cung cấp'}
              </p>
            )}
            {activeOrder.note_order && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold pt-1">
                Ghi chú: "{activeOrder.note_order}"
              </p>
            )}
          </div>
        </div>

        {/* Items snapshot */}
        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-neutral-500 text-xs">
            Sản phẩm trong đơn ({items.length})
          </h4>
          {loadingDetail ? (
            <div className="py-4 text-center text-neutral-400 text-xs italic">
              Đang tải danh sách sản phẩm...
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-y-auto pr-1 scrollbar-none">
              {items.length === 0 ? (
                <div className="py-3 text-center text-neutral-400 text-xs">
                  Không có thông tin chi tiết sản phẩm.
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={item.order_item_id || idx} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <h5 className="font-bold text-black dark:text-white uppercase line-clamp-1">
                        {item.name_product_order_item || item.name_product || 'Sản phẩm'}
                      </h5>
                      <p className="text-neutral-400 text-[10px] uppercase font-mono">
                        SKU: {item.sku_order_item || 'N/A'} {item.variant_order_item ? `• ${item.variant_order_item}` : ''} • SL: x{item.quantity_order_item || item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-black dark:text-white shrink-0">
                      {formatPriceVND(item.total_order_item || item.price_order_item * (item.quantity_order_item || item.quantity))}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Total breakdown */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-xs">
          <div className="flex justify-between text-neutral-500">
            <span>Tạm tính:</span>
            <span className="font-bold text-black dark:text-white">{formatPriceVND(activeOrder.subtotal_order)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phí giao hàng:</span>
            <span className="font-bold text-black dark:text-white">{formatPriceVND(activeOrder.shipping_fee_order)}</span>
          </div>
          {activeOrder.discount_order > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Mã giảm giá ({activeOrder.code_voucher_order || 'Voucher'}):</span>
              <span>-{formatPriceVND(activeOrder.discount_order)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-black dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="uppercase tracking-wider">Tổng thanh toán:</span>
            <span className="text-base font-display">{formatPriceVND(activeOrder.total_order)}</span>
          </div>
        </div>

        {/* Transition Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
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
                  className="px-3 py-1.5 rounded-lg border border-neutral-300 text-neutral-600 font-bold text-xs"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleCancelSubmit}
                  disabled={isActionPending}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                >
                  Xác nhận hủy đơn
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {allowedActions.includes('confirm') && (
                  <button
                    type="button"
                    onClick={() => onConfirm(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-40"
                  >
                    Xác nhận đơn
                  </button>
                )}
                {allowedActions.includes('processing') && (
                  <button
                    type="button"
                    onClick={() => onProcess(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-40"
                  >
                    Chuẩn bị hàng
                  </button>
                )}
                {allowedActions.includes('shipping') && (
                  <button
                    type="button"
                    onClick={() => onShip(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-40"
                  >
                    Giao hàng
                  </button>
                )}
                {allowedActions.includes('complete') && (
                  <button
                    type="button"
                    onClick={() => onComplete(orderId)}
                    disabled={isActionPending}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-40"
                  >
                    Hoàn thành
                  </button>
                )}
                {allowedActions.includes('cancel') && (
                  <button
                    type="button"
                    onClick={() => setShowCancelInput(true)}
                    disabled={isActionPending}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-85 cursor-pointer shadow-md"
              >
                Đóng
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
