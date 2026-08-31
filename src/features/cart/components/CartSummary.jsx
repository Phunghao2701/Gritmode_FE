import React from 'react';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Icon from '../../../shared/components/Icon';

export default function CartSummary({
  subtotal = 0,
  formattedSubtotal = '0 ₫',
  onCheckout,
  totalItems = 0,
  hasStockIssues = false,
}) {
  return (
    <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-4">
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-500">
          <span>Tạm tính ({totalItems} sản phẩm):</span>
          <span className="font-bold text-black dark:text-white">{formattedSubtotal}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-500">
          <span>Vận chuyển:</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
            Tính ở bước kế tiếp
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-black text-black dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <span className="uppercase tracking-wider">Tổng cộng:</span>
          <span className="text-base font-display">{formattedSubtotal}</span>
        </div>
      </div>

      {hasStockIssues && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-bold flex items-center gap-2">
          <Icon icon="solar:danger-triangle-bold" className="shrink-0" />
          <span>Vui lòng giảm số lượng sản phẩm vượt quá tồn kho để thanh toán.</span>
        </div>
      )}

      <PrimaryButton
        onClick={onCheckout}
        disabled={hasStockIssues}
        className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-black rounded-2xl shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
        size="lg"
      >
        Tiến hành thanh toán
      </PrimaryButton>
    </div>
  );
}
