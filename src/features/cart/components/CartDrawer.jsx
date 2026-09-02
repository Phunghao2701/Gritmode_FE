import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import EmptyState from '../../../shared/components/EmptyState';
import { useCart } from '../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import { toast } from '../../../shared/utils/toast';
import { useSmoothScroll } from '../../../shared/components/SmoothScrollProvider';

export default function CartDrawer() {
  const navigate = useNavigate();
  const lenis = useSmoothScroll();
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

  // Handle Escape key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Stop Lenis and lock body scroll while drawer is open
    if (lenis) lenis.stop();
    else if (typeof window !== 'undefined' && window.__lenis) window.__lenis.stop();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      if (lenis) lenis.start();
      else if (typeof window !== 'undefined' && window.__lenis) window.__lenis.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, lenis, closeDrawer]);

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
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-400 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible delay-200'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Smooth Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-400 ease-out cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeDrawer}
      />

      {/* Sliding Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
        <div
          className={`w-screen max-w-md bg-white dark:bg-neutral-950 text-black dark:text-white shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col justify-between pointer-events-auto transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-sans font-[550] text-lg uppercase tracking-tight">
                Giỏ hàng của bạn
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-[550] bg-black text-white dark:bg-white dark:text-black transition-transform duration-300">
                {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={isMutating}
                  className="text-[11px] font-normal uppercase tracking-wider text-neutral-400 hover:text-rose-500 transition-colors underline cursor-pointer disabled:opacity-40"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="button"
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer text-xl"
                aria-label="Đóng giỏ hàng"
              >
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>
          </div>

          {/* Freeship Highlight Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-900/50 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Icon icon="solar:delivery-bold" className="text-base text-emerald-500 shrink-0" />
            <span>Đơn hàng của bạn được <strong>FREESHIP TOÀN QUỐC 0Đ</strong>!</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 overscroll-contain">
            {items.length === 0 ? (
              <div className="py-12 animate-fade-in">
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
                {items.map((item, index) => {
                  const itemId = item.cart_item_id || item.variantId || item.id;
                  return (
                    <CartItem
                      key={itemId}
                      item={item}
                      index={index}
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

