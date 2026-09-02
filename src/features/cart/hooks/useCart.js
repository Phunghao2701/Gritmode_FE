/**
 * useCart Hook
 * Provides a unified React interface for Cart state, server actions, and drawer controls.
 */
import { useCartStore } from '../../../app/store/cartStore';
import { formatPriceVND } from '../../../shared/utils/formatNumber';

export const useCart = () => {
  const cartStore = useCartStore();


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
    formattedSubtotal: formatPriceVND(subtotal),
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
