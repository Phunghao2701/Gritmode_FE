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

  return (
    <div className={`flex gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 transition-opacity ${isRemoving ? 'opacity-30' : 'opacity-100'}`}>
      <div className="relative w-18 h-24 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shrink-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=150'}
          alt={item.title}
          className="w-full h-full object-contain p-1"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-1">
            <span className="text-[9px] font-black text-rose-400 uppercase text-center leading-tight">
              Quá tồn kho
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-black text-xs text-black dark:text-white line-clamp-1 uppercase tracking-tight">
              {item.title}
            </h4>
            <button
              type="button"
              onClick={() => onRemove(itemId)}
              disabled={isRemoving}
              className="text-neutral-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer disabled:opacity-40"
              title="Xóa khỏi giỏ"
            >
              {isRemoving ? (
                <Icon icon="solar:spinner-linear" className="animate-spin text-base" />
              ) : (
                <Icon icon="solar:trash-bin-minimalistic-linear" className="text-base" />
              )}
            </button>
          </div>

          {item.variant && (
            <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wider">
              {item.variant}
            </p>
          )}

          {isOutOfStock && (
            <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
              <Icon icon="solar:danger-triangle-bold" />
              <span>Chỉ còn {item.quantity_available} sản phẩm sẵn có</span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-xs text-black dark:text-white">
            {formatPriceVND(item.line_total || item.price * item.quantity)}
          </span>

          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              disabled={isUpdating || isRemoving}
              className="w-6 h-6 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-black cursor-pointer rounded-lg disabled:opacity-30"
            >
              -
            </button>
            <span className="w-7 text-center text-xs font-black text-black dark:text-white">
              {isUpdating ? (
                <Icon icon="solar:spinner-linear" className="animate-spin inline-block" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              disabled={isUpdating || isRemoving || (item.quantity_available > 0 && item.quantity >= item.quantity_available)}
              className="w-6 h-6 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-black cursor-pointer rounded-lg disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
