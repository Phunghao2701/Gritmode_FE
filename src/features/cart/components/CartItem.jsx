import React from 'react';
import Icon from '../../../shared/components/Icon';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) {
  const itemId = item.cart_item_id || item.variantId || item.id;
  const isOutOfStock = item.has_stock_issue || item.quantity > item.quantity_available;

  // Format variant into Color and Size
  let colorText = '';
  let sizeText = '';

  if (item.variant) {
    if (item.variant.includes('/')) {
      const parts = item.variant.split('/').map((s) => s.trim());
      colorText = parts[0] || '';
      sizeText = parts[1] || '';
    } else if (item.variant.includes('·')) {
      const parts = item.variant.split('·').map((s) => s.trim());
      colorText = parts[0] || '';
      sizeText = parts[1] || '';
    } else if (['S', 'M', 'L', 'XL', '2XL', 'XXL'].includes(item.variant.toUpperCase())) {
      sizeText = item.variant;
    } else {
      colorText = item.variant;
    }
  }

  if (item.color) colorText = item.color;
  if (item.size) sizeText = item.size;

  return (
    <div
      className={`flex gap-4 py-5 border-b border-neutral-100 dark:border-neutral-800 transition-all duration-300 ${
        isRemoving ? 'opacity-30 scale-95' : 'opacity-100'
      }`}
    >
      {/* Product Image Thumbnail */}
      <div className="relative w-24 h-28 border border-neutral-200 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900 flex items-center justify-center p-1">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <Icon icon="solar:t-shirt-bold-duotone" className="text-3xl text-neutral-300" />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-1 animate-fade-in">
            <span className="text-[9px] font-bold text-rose-400 uppercase text-center leading-tight">
              Quá tồn kho
            </span>
          </div>
        )}
      </div>

      {/* Product Info & Controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h4 className="font-normal text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
            {item.title}
          </h4>

          <div className="font-normal text-sm text-neutral-800 dark:text-neutral-200 mt-1">
            {formatPriceVND(item.price || item.line_total)}
          </div>

          <div className="mt-2 space-y-0.5 text-xs text-neutral-500 font-normal">
            {colorText && (
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full border border-neutral-400 bg-transparent" />
                <span>{colorText}</span>
              </div>
            )}
            {sizeText && (
              <div>
                <span>Kích thước: {sizeText}</span>
              </div>
            )}
            {!colorText && !sizeText && item.variant && (
              <div>
                <span>Phân loại: {item.variant}</span>
              </div>
            )}
          </div>

          {isOutOfStock && (
            <p className="text-[10px] font-normal text-rose-500 mt-1 flex items-center gap-1">
              <Icon icon="solar:danger-triangle-bold" />
              <span>Chỉ còn {item.quantity_available} sản phẩm sẵn có</span>
            </p>
          )}
        </div>

        {/* Stepper + Xoá link */}
        <div className="flex items-center justify-between mt-3">
          {/* Stepper Pill */}
          <div className="inline-flex items-center gap-4 px-3 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-normal">
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              disabled={isUpdating || isRemoving}
              className="text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer disabled:opacity-30 transition-colors select-none text-sm leading-none"
              aria-label="Giảm số lượng"
            >
              −
            </button>
            <span className="w-4 text-center text-xs font-normal text-black dark:text-white tabular-nums select-none">
              {isUpdating ? (
                <Icon icon="solar:spinner-linear" className="animate-spin inline-block text-[10px]" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              disabled={isUpdating || isRemoving || isOutOfStock}
              className="text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer disabled:opacity-30 transition-colors select-none text-sm leading-none"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>

          {/* Xoá Link */}
          <button
            type="button"
            onClick={() => onRemove(itemId)}
            disabled={isRemoving}
            className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer disabled:opacity-40 transition-colors"
          >
            {isRemoving ? 'Đang xóa...' : 'Xoá'}
          </button>
        </div>
      </div>
    </div>
  );
}
