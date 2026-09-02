import React, { useState } from 'react';
import { formatPriceVND } from '../../products/utils/product.utils';
import { validateVoucherApi } from '../../vouchers/apis/voucher.api';
import { toast } from '../../../shared/utils/toast';
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
  onUpdateQuantity,
  onRemoveItem,
  isLoading = false,
}) {
  const [voucherCode, setVoucherCode] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsApplyingVoucher(true);
    try {
      const res = await validateVoucherApi(cleanCode);
      const voucherData = res.data?.data || res.data;
      onApplyVoucher(voucherData);
      toast.success(`Áp dụng mã giảm giá "${voucherData.code_voucher || cleanCode}" thành công!`);
      setVoucherCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Giỏ hàng Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          Giỏ hàng
        </h3>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-4">
          {items.map((item, idx) => {
            const itemId = item.cart_item_id || item.variantId || item.id || idx;
            const variantPill = item.variant
              ? item.variant
              : (item.color || item.size ? `${item.color || ''} / ${item.size || ''}`.trim() : '');

            return (
              <div key={itemId} className="pt-4 first:pt-0 flex items-start gap-3">
                {/* Product Thumbnail */}
                <div className="w-14 h-14 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-1 flex items-center justify-center shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Icon icon="solar:t-shirt-bold-duotone" className="text-xl text-neutral-300" />
                  )}
                </div>

                {/* Info & Stepper */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-normal text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {item.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onRemoveItem?.(itemId)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer text-base"
                      title="Xóa khỏi giỏ"
                    >
                      <Icon icon="solar:trash-bin-trash-linear" />
                    </button>
                  </div>

                  {/* Variant Pill */}
                  {variantPill && (
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 font-normal">
                        <span>{variantPill}</span>
                        <Icon icon="solar:alt-arrow-right-linear" className="text-[10px]" />
                      </span>
                    </div>
                  )}

                  {/* Price & Stepper */}
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {formatPriceVND(item.line_total || item.price * item.quantity)}
                    </span>

                    {/* Stepper */}
                    <div className="inline-flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-0.5 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity?.(itemId, item.quantity - 1)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer select-none text-xs"
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="w-3 text-center text-xs font-normal tabular-nums text-neutral-800 dark:text-neutral-200 select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity?.(itemId, item.quantity + 1)}
                        className="text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer select-none text-xs"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Mã khuyến mãi Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-3">
        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          Mã khuyến mãi
        </h3>

        {/* Applied Voucher or Select Voucher button */}
        {appliedVoucher ? (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:ticket-bold" className="text-emerald-600 dark:text-emerald-400 text-base" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {appliedVoucher.code_voucher || appliedVoucher.code}
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="text-xs text-neutral-400 hover:text-rose-500 cursor-pointer"
              title="Gỡ mã"
            >
              <Icon icon="solar:close-circle-linear" className="text-base" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="w-full border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 transition-colors cursor-pointer bg-white dark:bg-neutral-950"
          >
            <div className="flex items-center gap-2">
              <Icon icon="solar:ticket-linear" className="text-base text-neutral-400" />
              <span>Chọn mã</span>
            </div>
            <Icon icon="solar:alt-arrow-right-linear" className="text-sm text-neutral-400" />
          </button>
        )}

        {/* Voucher Input */}
        <form onSubmit={handleApplyVoucher} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã khuyến mãi"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            className="flex-1 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs placeholder:text-neutral-400 bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          <button
            type="submit"
            disabled={!voucherCode.trim() || isApplyingVoucher}
            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-85 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isApplyingVoucher ? '...' : 'Áp dụng'}
          </button>
        </form>
      </div>

      {/* 3. Tóm tắt đơn hàng Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
          Tóm tắt đơn hàng
        </h3>

        <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex justify-between items-center">
            <span>Tổng tiền hàng</span>
            <span className="font-normal text-neutral-900 dark:text-neutral-100">{formatPriceVND(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Phí vận chuyển</span>
            <span className="font-normal text-neutral-900 dark:text-neutral-100">
              {shippingFee === 0 ? '-' : formatPriceVND(shippingFee)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-normal">
              <span>Chiết khấu mã giảm giá</span>
              <span>-{formatPriceVND(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-sm font-bold text-neutral-900 dark:text-neutral-100 border-t border-neutral-100 dark:border-neutral-800">
            <span>Tổng thanh toán</span>
            <span className="text-base font-bold">{formatPriceVND(finalAmount)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={isLoading || items.length === 0}
          className="w-full bg-black text-white dark:bg-white dark:text-black py-3.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer shadow-md"
        >
          {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </div>
    </div>
  );
}
