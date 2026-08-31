import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function StockAdjustModal({ item, onClose, onAdjustSubmit, isLoading = false }) {
  const currentStock = Number(item?.quantity_stock ?? item?.onHand ?? 0);
  const reserved = Number(item?.quantity_reserved ?? 0);
  const [newStock, setNewStock] = useState(currentStock);

  if (!item) return null;

  const variantId = item.product_variant_id || item.variantId || item.id;
  const newAvailable = Math.max(0, newStock - reserved);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newStock < reserved) {
      alert(`Số lượng tồn kho không thể nhỏ hơn số lượng đang giữ chỗ đơn hàng (${reserved} chiếc).`);
      return;
    }
    onAdjustSubmit({ variantId, quantityStock: Number(newStock) });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Điều chỉnh tồn kho
            </span>
            <h3 className="font-mono font-black text-lg text-black dark:text-white uppercase mt-0.5">
              {item.sku || 'SKU'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-2">
            <p className="font-bold text-black dark:text-white uppercase">{item.name_product || item.productTitle || item.name}</p>
            <p className="text-neutral-400 text-[10px]">Variant: {item.variant || item.size || 'Default'}</p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[11px]">
              <div>
                <span className="text-neutral-400 block">Tồn hiện tại:</span>
                <span className="font-black text-black dark:text-white">{currentStock} chiếc</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Đang giữ chỗ:</span>
                <span className="font-black text-amber-500">{reserved} chiếc</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold uppercase tracking-wider text-neutral-500 block">
              Tổng số lượng tồn kho thực tế mới (quantity_stock) *
            </label>
            <input
              type="number"
              min={reserved}
              required
              value={newStock}
              onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-black text-base focus:outline-none focus:border-black dark:focus:border-white"
            />
            <p className="text-[10px] text-neutral-400">
              Số lượng có thể bán dự kiến (Available): <span className="font-bold text-emerald-500">{newAvailable} chiếc</span>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-black dark:hover:border-white transition-all cursor-pointer"
            >
              Hủy
            </button>
            <PrimaryButton type="submit" isLoading={isLoading} size="sm">
              Xác nhận lưu
            </PrimaryButton>
          </div>
        </form>

      </div>
    </div>
  );
}
