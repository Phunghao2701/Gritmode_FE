import React from 'react';
import Icon from '../../../shared/components/Icon';
import { formatPriceVND } from '../../products/utils/product.utils';

export default function CartItem({
  item,
  index = 0,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) {
  const itemId = item.cart_item_id || item.variantId || item.id;
  const isOutOfStock = item.has_stock_issue || item.quantity > item.quantity_available;

  return (
    <div
      className={`group flex gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800/80 transition-all duration-300 ${
        isRemoving ? 'opacity-30 scale-95' : 'opacity-100'
      }`}
      style={{
        animation: `fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s both`,
      }}
    >
      {/* Product Image Thumbnail */}
      <div className="relative w-18 h-24 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <Icon icon="solar:t-shirt-bold-duotone" className="text-2xl text-neutral-400" />
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center p-1 animate-fade-in">
            <span className="text-[9px] font-black text-rose-400 uppercase text-center leading-tight">
              Quá tồn kho
            </span>
          </div>
        )}
      </div>

      {/* Product Info & Controls */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-normal text-xs text-black dark:text-white line-clamp-1 uppercase tracking-tight transition-colors group-hover:text-neutral-700 dark:group-hover:text-neutral-200">
              {item.title}
            </h4>
            <button
              type="button"
              onClick={() => onRemove(itemId)}
              disabled={isRemoving}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all duration-200 cursor-pointer disabled:opacity-40 active:scale-90"
              title="Xóa khỏi giỏ"
              aria-label="Xóa sản phẩm"
            >
              {isRemoving ? (
                <Icon icon="solar:spinner-linear" className="animate-spin text-base" />
              ) : (
                <Icon icon="solar:trash-bin-minimalistic-linear" className="text-base transition-transform hover:scale-110" />
              )}
            </button>
          </div>

          {item.variant && (
            <p className="text-[10px] font-normal text-neutral-400 mt-0.5 uppercase tracking-wider">
              {item.variant}
            </p>
          )}

          {isOutOfStock && (
            <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1 animate-pulse">
              <Icon icon="solar:danger-triangle-bold" />
              <span>Chỉ còn {item.quantity_available} sản phẩm sẵn có</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-[550] text-xs text-black dark:text-white tracking-tight">
            {formatPriceVND(item.line_total || item.price * item.quantity)}
          </span>

          {/* Stepper Buttons */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-0.5 shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              disabled={isUpdating || isRemoving}
              className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-[550] cursor-pointer rounded-lg disabled:opacity-30 active:scale-90 transition-all duration-150"
              aria-label="Giảm số lượng"
            >
              -
            </button>
            <span className="w-7 text-center text-xs font-[550] text-black dark:text-white tabular-nums select-none">
              {isUpdating ? (
                <Icon icon="solar:spinner-linear" className="animate-spin inline-block text-[11px]" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              disabled={isUpdating || isRemoving || (item.quantity_available > 0 && item.quantity >= item.quantity_available)}
              className="w-6 h-6 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-[550] cursor-pointer rounded-lg disabled:opacity-30 active:scale-90 transition-all duration-150"
              aria-label="Tăng số lượng"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

