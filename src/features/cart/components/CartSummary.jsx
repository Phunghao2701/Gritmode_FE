import React from 'react';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Icon from '../../../shared/components/Icon';

export default function CartSummary({
  formattedSubtotal = '0 ₫',
  onCheckout,
  totalItems = 0,
  hasStockIssues = false,
}) {
  return (
    <div className="p-5 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm space-y-4">
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-500 uppercase tracking-wider font-normal">
          <span>Tạm tính ({totalItems} sản phẩm):</span>
          <span className="font-[550] text-black dark:text-white tracking-normal">{formattedSubtotal}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-500 uppercase tracking-wider font-normal">
          <span>Vận chuyển:</span>
          <span className="text-[10px] font-normal uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Miễn phí toàn quốc
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-[550] text-black dark:text-white pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
          <span className="uppercase tracking-wider">Tổng cộng:</span>
          <span className="text-base font-sans font-[550]">{formattedSubtotal}</span>
        </div>
      </div>

      {hasStockIssues && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] font-normal uppercase tracking-wider flex items-center gap-2 animate-pulse">
          <Icon icon="solar:danger-triangle-bold" className="shrink-0" />
          <span>Vui lòng giảm số lượng sản phẩm vượt quá tồn kho để thanh toán.</span>
        </div>
      )}

      <PrimaryButton
        onClick={onCheckout}
        disabled={hasStockIssues}
        className="w-full justify-center py-3.5 uppercase tracking-widest text-xs font-[550] rounded-2xl shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        size="lg"
      >
        Tiến hành thanh toán
      </PrimaryButton>
    </div>
  );
}

