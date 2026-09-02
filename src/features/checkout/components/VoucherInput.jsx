import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import { validateVoucherApi } from '../../vouchers/apis/voucher.api';
import { formatPriceVND } from '../../products/utils/product.utils';
import { toast } from '../../../shared/utils/toast';

export default function VoucherInput({ appliedVoucher, onApplyVoucher, onRemoveVoucher }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    try {
      const res = await validateVoucherApi(cleanCode);
      const voucherData = res.data?.data || res.data;
      onApplyVoucher(voucherData);
      toast.success(`Áp dụng mã giảm giá "${voucherData.code_voucher}" thành công!`);
      setCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết lượt.');
    } finally {
      setIsLoading(false);
    }
  };

  if (appliedVoucher) {
    const discountAmount = appliedVoucher.discount_amount ?? appliedVoucher.discountAmount ?? 0;
    const codeVoucher = appliedVoucher.code_voucher || appliedVoucher.code || 'VOUCHER';
    const nameVoucher = appliedVoucher.name_voucher || appliedVoucher.name || '';

    return (
      <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-lg">
            <Icon icon="solar:ticket-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black uppercase text-xs tracking-wider text-black dark:text-white">
                {codeVoucher}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ĐÃ ÁP DỤNG
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
              {nameVoucher ? `${nameVoucher} — ` : ''}Tiết kiệm: <span className="text-black dark:text-white font-black">{formatPriceVND(discountAmount)}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemoveVoucher}
          className="text-xs font-bold text-neutral-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Gỡ mã giảm giá"
        >
          <Icon icon="solar:close-circle-linear" className="text-lg" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply} className="flex gap-2">
      <div className="relative flex-1">
        <Icon icon="solar:ticket-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
        <input
          type="text"
          placeholder=""
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full pl-10 pr-3 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono font-black text-black dark:text-white placeholder:text-neutral-400 placeholder:font-sans focus:outline-none focus:border-black dark:focus:border-white uppercase transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-wider hover:opacity-85 disabled:opacity-40 transition-all cursor-pointer shadow-md"
      >
        {isLoading ? (
          <Icon icon="solar:spinner-linear" className="animate-spin inline-block text-base" />
        ) : (
          'Áp dụng'
        )}
      </button>
    </form>
  );
}
