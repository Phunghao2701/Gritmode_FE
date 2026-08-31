/**
 * useCart Hook
 * Provides a unified React interface for Cart state, server actions, and drawer controls.
 */
import { useCartStore } from '../../../app/store/cartStore';

export const useCart = () => {
  const cartStore = useCartStore();

  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);
  };

  const items = cartStore.items || [];
  const subtotal = cartStore.getSubtotal();
  const totalItems = cartStore.getTotalItems();
  const isOpen = cartStore.isDrawerOpen || false;

  return {
    items,
    cartId: cartStore.cart_id,
    statusCart: cartStore.status_cart,
    isOpen,
    isDrawerOpen: isOpen,
    isLoadingCart: cartStore.isLoadingCart,
    isMutating: cartStore.isMutating,
    updatingItemIds: cartStore.updatingItemIds || [],
    removingItemIds: cartStore.removingItemIds || [],
    totalItems,
    subtotal,
    formattedSubtotal: formatPrice(subtotal),
    openDrawer: cartStore.openDrawer,
    closeDrawer: cartStore.closeDrawer,
    toggleDrawer: cartStore.toggleDrawer,
    fetchCart: cartStore.fetchCart,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
  };
};
