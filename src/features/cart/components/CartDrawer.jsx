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
    updatingItemIds,
    removingItemIds,
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
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h2 className="font-normal text-xl text-black dark:text-white">
              {totalItems} sản phẩm trong giỏ hàng
            </h2>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-all cursor-pointer text-2xl"
              aria-label="Đóng giỏ hàng"
            >
              <Icon icon="solar:close-linear" />
            </button>
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

