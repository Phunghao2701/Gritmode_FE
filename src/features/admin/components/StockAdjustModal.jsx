import { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function StockAdjustModal({ item, onClose, onAdjustSubmit, isLoading = false }) {
  const currentStock = Number(item?.quantity_stock ?? item?.onHand ?? 0);
  const reserved = Number(item?.quantity_reserved ?? 0);
  const [newStock, setNewStock] = useState(currentStock);

  if (!item) return null;

  const variantId = item.product_variant_id || item.variantId || item.id;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newStock < reserved) {
      alert(`Số lượng tồn kho không thể nhỏ hơn số lượng đang giữ chỗ đơn hàng (${reserved} chiếc).`);
      return;
    }
    onAdjustSubmit({ variantId, quantityStock: Number(newStock) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-sans font-[550] backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
          <div className="min-w-0">
            <span className="font-sans text-[10px] font-[550] uppercase tracking-widest text-neutral-400">
              Điều chỉnh tồn kho
            </span>
            <h3 className="mt-0.5 break-words font-sans text-base font-[550] leading-tight tracking-tight text-black dark:text-white sm:text-lg">
              {item.sku || 'SKU'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng điều chỉnh tồn kho"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-lg text-neutral-400 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
          >
            <Icon icon="solar:close-linear" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/50">
            <p className="font-sans font-[550] uppercase text-black dark:text-white">{item.name_product || item.productTitle || item.name}</p>
            <div className="border-t border-neutral-200 pt-2 text-[11px] dark:border-neutral-700">
              <div>
                <span className="block font-normal text-neutral-400">Tồn hiện tại:</span>
                <span className="font-sans font-[550] text-black dark:text-white">{currentStock} chiếc</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-sans text-xs font-[550] uppercase tracking-wider text-neutral-500">
              Số lượng
            </label>
            <input
              type="number"
              min={reserved}
              required
              value={newStock}
              onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 font-sans text-base font-[550] text-black focus:border-black focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-300 px-4 py-2.5 font-sans text-xs font-[550] text-neutral-600 transition-all hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500"
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
