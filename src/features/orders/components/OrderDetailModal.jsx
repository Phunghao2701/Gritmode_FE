import React from 'react';
import Icon from '../../../shared/components/Icon';
import { getOrderStatusInfo, getPaymentStatusInfo, isOrderCancellable } from '../utils/order.utils';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  isCancelling = false,
}) {
  if (!isOpen || !order) return null;

  const orderStatus = getOrderStatusInfo(order.status_order);
  const paymentStatus = getPaymentStatusInfo(order.payment?.status_payment);
  const cancellable = isOrderCancellable(order.status_order, order.payment?.status_payment);

  const address = order.address || {};
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Chi tiết đơn hàng</span>
            <h3 className="font-mono font-black text-lg sm:text-xl uppercase text-black dark:text-white mt-0.5">
              {order.order_code || `#ORD-${order.order_id}`}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Đặt ngày {new Date(order.created_at || Date.now()).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-black dark:hover:text-white p-1 rounded-full cursor-pointer text-2xl"
            >
              <Icon icon="solar:close-circle-linear" />
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Trạng thái đơn hàng</span>
            <div className="mt-1">
              <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${orderStatus.color}`}>
                {orderStatus.label}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Thanh toán</span>
            <div className="mt-1">
              <span className={`inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${paymentStatus.color}`}>
                {order.payment?.payment_method?.toUpperCase() || 'COD'} • {paymentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Icon icon="solar:map-point-bold" />
            <span>Địa chỉ nhận hàng</span>
          </span>
          <p className="font-black text-black dark:text-white">
            {address.receiver_name_order_address || order.receiver_name_order_address || order.email_order} — {address.phone_order_address || order.phone_order_address || order.phone_order}
          </p>
          <p className="text-neutral-500 leading-relaxed">
            {[
              address.address_line_order_address || order.address_line_order_address,
              address.ward_order_address || order.ward_order_address,
              address.district_order_address || order.district_order_address,
              address.province_order_address || order.province_order_address,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>

        {/* Order Items Snapshot */}
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-neutral-500">
            Sản phẩm trong đơn ({items.length})
          </span>
          <div className="max-h-52 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-900 pr-1 scrollbar-none">
            {items.map((item, idx) => (
              <div key={item.order_item_id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-black dark:text-white uppercase line-clamp-1">
                    {item.name_product_order_item || item.name_product || 'Sản phẩm'}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {item.variant_order_item ? `${item.variant_order_item} • ` : ''}SL: {item.quantity_order_item || item.quantity}
                  </p>
                </div>
                <span className="font-black text-black dark:text-white">
                  {formatPriceVND(item.total_order_item || item.price_order_item * (item.quantity_order_item || item.quantity))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
          <div className="flex justify-between text-neutral-500">
            <span>Tạm tính:</span>
            <span className="font-bold text-black dark:text-white">{formatPriceVND(order.subtotal_order)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Phí giao hàng:</span>
            <span className="font-bold text-black dark:text-white">{formatPriceVND(order.shipping_fee_order)}</span>
          </div>
          {order.discount_order > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Mã giảm giá ({order.code_voucher_order || 'Voucher'}):</span>
              <span>-{formatPriceVND(order.discount_order)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-black dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <span className="uppercase tracking-wider">Tổng thanh toán:</span>
            <span className="text-base font-display">{formatPriceVND(order.total_order)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between gap-3">
          {cancellable && (
            <button
              type="button"
              onClick={() => onCancelOrder(order.order_id || order.order_code)}
              disabled={isCancelling}
              className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black uppercase tracking-wider disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              {isCancelling ? (
                <Icon icon="solar:spinner-linear" className="animate-spin" />
              ) : (
                <Icon icon="solar:trash-bin-minimalistic-linear" />
              )}
              <span>Hủy đơn hàng</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-6 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-85 cursor-pointer shadow-md"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
