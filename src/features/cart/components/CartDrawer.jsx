import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import EmptyState from '../../../shared/components/EmptyState';
import { useCart } from '../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { toast } from '../../../shared/utils/toast';

export default function CartDrawer() {
  const navigate = useNavigate();
  const {
    isOpen,
    closeDrawer,
    items,
    totalItems,
    formattedSubtotal,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    updatingItemIds,
    removingItemIds,
    isMutating,
  } = useCart();

  if (!isOpen) return null;

  const hasStockIssues = items.some(
    (item) => item.has_stock_issue || item.quantity > item.quantity_available
  );

  const handleCheckout = () => {
    if (hasStockIssues) {
      toast.error('Một số sản phẩm trong giỏ đã vượt quá tồn kho. Vui lòng điều chỉnh số lượng trước khi thanh toán.');
      return;
    }
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-950 text-black dark:text-white shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-lg uppercase tracking-tight">
                Giỏ hàng của bạn
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black text-white dark:bg-white dark:text-black">
                {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={isMutating}
                  className="text-[11px] font-bold text-neutral-400 hover:text-rose-500 transition-colors underline cursor-pointer disabled:opacity-40"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={closeDrawer}
                className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-xl"
              >
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="Giỏ hàng trống"
                  description="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Khám phá các mẫu Streetwear mới nhất ngay!"
                  icon="solar:bag-smile-linear"
                  actionLabel="Khám phá sản phẩm"
                  onAction={() => {
                    closeDrawer();
                    navigate('/products');
                  }}
                />
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => {
                  const itemId = item.cart_item_id || item.variantId || item.id;
                  return (
                    <CartItem
                      key={itemId}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                      isUpdating={updatingItemIds.includes(itemId)}
                      isRemoving={removingItemIds.includes(itemId)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary & Checkout Footer */}
          {items.length > 0 && (
            <CartSummary
              subtotal={subtotal}
              formattedSubtotal={formattedSubtotal}
              totalItems={totalItems}
              onCheckout={handleCheckout}
              hasStockIssues={hasStockIssues}
            />
          )}

        </div>
      </div>
    </div>
  );
}
