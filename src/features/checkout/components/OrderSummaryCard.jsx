import React from 'react';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import VoucherInput from './VoucherInput';
import { formatPriceVND } from '../../products/utils/product.utils';
import Icon from '../../../shared/components/Icon';

export default function OrderSummaryCard({
  items = [],
  subtotal = 0,
  shippingFee = 0,
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
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
        <h3 className="font-display font-black text-lg uppercase tracking-tight text-black dark:text-white">
          Tóm tắt đơn hàng
        </h3>
        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
          {items.length} món
        </span>
      </div>

      {/* Items list */}
      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800 pr-1 scrollbar-none space-y-0.5">
        {items.map((item, idx) => {
          const itemId = item.cart_item_id || item.variantId || item.id || idx;
          const formattedVariant = item.variant
            ? item.variant.replace(/\s*\/\s*/g, ' · ').replace(/\s*•\s*/g, ' · ')
            : '';

          return (
            <div key={itemId} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-12 h-16 object-contain rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950 p-0.5"
                  />
                ) : (
                  <div className="w-12 h-16 rounded-xl border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center text-neutral-400">
                    <Icon icon="solar:t-shirt-bold-duotone" className="text-xl" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-black dark:text-white line-clamp-1 uppercase text-xs">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium truncate">
                    {formattedVariant ? `${formattedVariant} · ` : ''}SL: <span className="font-bold text-black dark:text-white">x{item.quantity}</span>
                  </p>
                </div>
              </div>
              <span className="font-black text-xs text-black dark:text-white shrink-0">
                {formatPriceVND(item.line_total || item.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Voucher Input */}
      <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <label className="text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
          Mã ưu đãi / Voucher
        </label>
        <VoucherInput
          appliedVoucher={appliedVoucher}
          onApplyVoucher={onApplyVoucher}
          onRemoveVoucher={onRemoveVoucher}
        />
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
          <span>Tạm tính:</span>
          <span className="font-bold text-black dark:text-white">{formatPriceVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
          <span>Phí vận chuyển:</span>
          {shippingFee === 0 ? (
            <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Miễn phí toàn quốc
            </span>
          ) : (
            <span className="font-bold text-black dark:text-white">{formatPriceVND(shippingFee)}</span>
          )}
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-black">
            <span>Chiết khấu mã giảm giá:</span>
            <span>-{formatPriceVND(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-black text-black dark:text-white pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span className="uppercase tracking-wider">Tổng thanh toán:</span>
          <span className="text-xl font-display font-black text-black dark:text-white">
            {formatPriceVND(finalAmount)}
          </span>
        </div>
      </div>

      {/* Submit Button with double-click prevention */}
      <div className="space-y-3">
        <PrimaryButton
          onClick={onSubmitOrder}
          isLoading={isLoading}
          disabled={items.length === 0 || isLoading}
          className="w-full justify-center py-4 uppercase tracking-widest text-xs font-black rounded-2xl shadow-xl disabled:opacity-40"
        >
          {isLoading ? 'Đang xử lý đơn hàng...' : 'Đặt hàng ngay'}
        </PrimaryButton>

        <p className="text-[10px] text-center text-neutral-400 leading-tight">
          Bằng việc đặt hàng, bạn đồng ý với Điều khoản mua sắm và Chính sách đổi trả 7 ngày của Gritmode.
        </p>
      </div>
    </div>
  );
}
