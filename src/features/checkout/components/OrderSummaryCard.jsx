import React from 'react';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import VoucherInput from './VoucherInput';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function OrderSummaryCard({
  items = [],
  subtotal = 0,
  shippingFee = 30000,
  discountAmount = 0,
  finalAmount = 0,
  appliedVoucher = null,
  onApplyVoucher,
  onRemoveVoucher,
  onSubmitOrder,
  isLoading = false,
}) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm">
      <h3 className="font-display font-black text-lg uppercase tracking-tight text-black dark:text-white">
        Tóm tắt đơn hàng ({items.length})
      </h3>

      {/* Items list */}
      <div className="max-h-64 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800 pr-1 scrollbar-none">
        {items.map((item, idx) => {
          const itemId = item.cart_item_id || item.variantId || item.id || idx;
          return (
            <div key={itemId} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=150'}
                  alt={item.title}
                  className="w-12 h-15 object-contain rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950 p-0.5"
                />
                <div>
                  <h4 className="font-bold text-black dark:text-white line-clamp-1 uppercase text-xs">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5 uppercase tracking-wider">
                    {item.variant ? `${item.variant} • ` : ''}SL: {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-black text-black dark:text-white shrink-0">
                {formatPriceVND(item.line_total || item.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Voucher Input */}
      <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <label className="text-xs font-black uppercase tracking-wider text-neutral-500">Mã ưu đãi</label>
        <VoucherInput
          appliedVoucher={appliedVoucher}
          onApplyVoucher={onApplyVoucher}
          onRemoveVoucher={onRemoveVoucher}
        />
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex justify-between text-neutral-500">
          <span>Tạm tính:</span>
          <span className="font-bold text-black dark:text-white">{formatPriceVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-500">
          <span>Phí vận chuyển toàn quốc:</span>
          <span className="font-bold text-black dark:text-white">{formatPriceVND(shippingFee)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-black">
            <span>Chiết khấu ưu đãi:</span>
            <span>-{formatPriceVND(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-black text-black dark:text-white pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span className="uppercase tracking-wider">Tổng thanh toán:</span>
          <span className="text-lg font-display">{formatPriceVND(finalAmount)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <PrimaryButton
        onClick={onSubmitOrder}
        isLoading={isLoading}
        disabled={items.length === 0 || isLoading}
        className="w-full justify-center py-4 uppercase tracking-widest text-xs font-black rounded-2xl shadow-xl disabled:opacity-40"
        size="lg"
      >
        Xác nhận đặt hàng
      </PrimaryButton>
    </div>
  );
}
