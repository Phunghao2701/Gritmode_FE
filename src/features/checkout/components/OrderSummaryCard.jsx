import React, { useState } from 'react';
import { formatPriceVND } from '../../products/utils/product.utils';
import { validateVoucherApi } from '../../vouchers/apis/voucher.api';
import { toast } from '../../../shared/utils/toast';
import Icon from '../../../shared/components/Icon';
import { requireApiObject } from '../../../shared/services/responseContract';

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
  const originalSubtotal = items.reduce((total, item) => {
    const salePrice = Number(item.price || 0);
    const originalPrice = Number(item.original_price ?? item.originalPrice ?? salePrice);
    return total + originalPrice * Number(item.quantity || 1);
  }, 0);
  const productDiscountAmount = Math.max(0, originalSubtotal - Number(subtotal || 0));

  const handleApplyVoucher = async (e) => {
    e.preventDefault();
    const cleanCode = voucherCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsApplyingVoucher(true);
    try {
      const res = await validateVoucherApi(cleanCode);
      const voucherData = requireApiObject(res, 'Voucher');
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
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
      {/* 1. Giỏ hàng Card */}
      <section className="space-y-4">
        <h3 className="font-sans font-[550] text-base text-neutral-900 dark:text-neutral-100">
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
                    {(() => {
                      const salePrice = Number(item.price || 0);
                      const originalPrice = Number(item.original_price ?? item.originalPrice ?? salePrice);
                      const quantity = Number(item.quantity || 1);
                      const lineTotal = Number(item.line_total || salePrice * quantity);
                      const hasSale = originalPrice > salePrice;
                      const discountPercent = hasSale && originalPrice > 0
                        ? Math.round((1 - salePrice / originalPrice) * 100)
                        : 0;

                      return (
                        <div className="flex flex-wrap items-baseline gap-2">
                          {hasSale && (
                            <span className="text-xs text-neutral-400 line-through">
                              {formatPriceVND(originalPrice * quantity)}
                            </span>
                          )}
                          <span className={`font-[550] text-sm ${hasSale ? 'text-red-600 dark:text-red-500' : 'text-neutral-900 dark:text-neutral-100'}`}>
                            {formatPriceVND(lineTotal)}
                          </span>
                          {discountPercent > 0 && (
                            <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-[550] text-red-600 dark:bg-red-950/40 dark:text-red-400">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                      );
                    })()}

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
      </section>

      {/* 2. Mã khuyến mãi Card */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-3">
        <h3 className="font-sans font-[550] text-base text-neutral-900 dark:text-neutral-100">
          Mã khuyến mãi
        </h3>

        {/* Applied Voucher or Select Voucher button */}
        {appliedVoucher && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="solar:ticket-bold" className="text-emerald-600 dark:text-emerald-400 text-base" />
              <span className="text-xs font-[550] text-emerald-700 dark:text-emerald-300">
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
            className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl text-xs font-[550] hover:opacity-85 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            {isApplyingVoucher ? '...' : 'Áp dụng'}
          </button>
        </form>
      </section>

      {/* 3. Tóm tắt đơn hàng Card */}
      <section className="border-t border-neutral-200 dark:border-neutral-800 pt-6 space-y-4">
        <h3 className="font-sans font-[550] text-base text-neutral-900 dark:text-neutral-100">
          Tóm tắt đơn hàng
        </h3>

        <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex justify-between items-center">
            <span>Tổng tiền hàng</span>
            <span className="font-normal text-neutral-900 dark:text-neutral-100">{formatPriceVND(subtotal)}</span>
          </div>

          {productDiscountAmount > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span>Giá gốc</span>
                <span className="text-neutral-400 line-through">{formatPriceVND(originalSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-normal">
                <span>Tiết kiệm sản phẩm</span>
                <span>-{formatPriceVND(productDiscountAmount)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center">
            <span>Phí vận chuyển</span>
            <span className="font-normal text-neutral-900 dark:text-neutral-100">
              {shippingFee === 0 ? 'Miễn phí' : formatPriceVND(shippingFee)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-normal">
              <span>Chiết khấu mã giảm giá</span>
              <span>-{formatPriceVND(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-sm font-[550] text-neutral-900 dark:text-neutral-100 border-t border-neutral-200 dark:border-neutral-800">
            <span>Tổng thanh toán</span>
            <span className="text-base font-[550]">{formatPriceVND(finalAmount)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmitOrder}
          disabled={isLoading || items.length === 0}
          className="w-full bg-black text-white dark:bg-white dark:text-black py-3.5 rounded-xl font-[550] text-sm hover:opacity-90 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer shadow-md"
        >
          {isLoading ? 'Đang xử lý...' : 'Đặt hàng'}
        </button>
      </section>
    </div>
  );
}
