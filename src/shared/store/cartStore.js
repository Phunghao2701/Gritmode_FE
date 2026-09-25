import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
} from '../../features/cart/apis/cart.api';
import { guestTokenService } from '../../features/cart/services/guestToken.service';
import { toast } from '../../shared/utils/toast';

const normalizeCartItem = (row) => {
  const cartItemId = Number(row.cart_item_id || row.id || 0);
  const variantId = Number(row.product_variant_id || row.variantId || 0);
  const price = Number(row.price || 0);
  const quantity = Number(row.quantity || row.quantity_cart_item || 1);
  const available = Number(row.quantity_available ?? 999);
  const lineTotal = Number(row.total_item || row.line_total || price * quantity);

  return {
    ...row,
    id: cartItemId || variantId,
    cart_item_id: cartItemId,
    product_variant_id: variantId,
    variantId: variantId,
    product_id: Number(row.product_id || 0),
    title: row.name_product || row.title || 'Sản phẩm Gritmode',
    name_product: row.name_product || row.title || 'Sản phẩm Gritmode',
    sku: row.sku || '',
    price,
    quantity,
    quantity_cart_item: quantity,
    quantity_available: available,
    image: row.image || row.url_product_image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300',
    variant: row.variant || (row.color || row.size ? `${row.color || ''} ${row.size || ''}`.trim() : ''),
    line_total: lineTotal,
    total_item: lineTotal,
    has_stock_issue: row.has_stock_issue || quantity > available,
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart_id: null,
      status_cart: 'active',
      items: [],
      summary: {
        total_items: 0,
        subtotal: 0,
      },
      guestToken: guestTokenService.getGuestToken(),

      // UI States
      isDrawerOpen: false,
      isLoadingCart: false,
      isMutating: false,
      updatingItemIds: [],
      removingItemIds: [],

      // Guest Token management
      setGuestToken: (token) => {
        guestTokenService.setGuestToken(token);
        set({ guestToken: token });
      },

      clearGuestToken: () => {
        guestTokenService.clearGuestToken();
        set({ guestToken: null });
      },

      // Drawer Actions
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      // Core State Setter from Backend
      setCartFromResponse: (data) => {
        if (!data) {
          set({
            cart_id: null,
            status_cart: 'active',
            items: [],
            summary: { total_items: 0, subtotal: 0 },
          });
          return;
        }

        const rawItems = Array.isArray(data.items) ? data.items : [];
        const normalizedItems = rawItems.map(normalizeCartItem);
        const totalItems = data.summary?.total_items ?? normalizedItems.reduce((acc, i) => acc + i.quantity, 0);
        const subtotal = data.summary?.subtotal ?? normalizedItems.reduce((acc, i) => acc + i.line_total, 0);

        if (data.guest_token) {
          get().setGuestToken(data.guest_token);
        }

        set({
          cart_id: data.cart_id || null,
          status_cart: data.status_cart || 'active',
          items: normalizedItems,
          summary: {
            total_items: totalItems,
            subtotal,
          },
        });
      },

      // Fetch Cart from BE
      fetchCart: async () => {
        set({ isLoadingCart: true });
        try {
          const res = await getCartApi();
          const data = res.data?.data || res.data;
          get().setCartFromResponse(data);
          return { success: true, data };
        } catch {
          // If guest doesn't have cart yet or 404, set clean state
          return { success: false };
        } finally {
          set({ isLoadingCart: false });
        }
      },

      // Add Item to Cart (Optimistic UI)
      addItem: async ({ variantId, product_variant_id, productId, quantity = 1, title, price, image, variant }) => {
        const targetVariantId = Number(product_variant_id || variantId);
        if (!targetVariantId) {
          toast.error('Vui lòng chọn phân loại sản phẩm hợp lệ.');
          return { success: false };
        }

        const qty = Math.max(1, Number(quantity) || 1);
        const prevItems = get().items;
        const prevSummary = get().summary;

        // 1. Optimistic Update Local Cart
        const existingIndex = prevItems.findIndex(
          (item) => Number(item.product_variant_id || item.variantId) === targetVariantId
        );

        let optimisticItems;
        if (existingIndex > -1) {
          optimisticItems = prevItems.map((item, idx) => {
            if (idx === existingIndex) {
              const newQty = item.quantity + qty;
              const lineTotal = newQty * (item.price || price || 0);
              return {
                ...item,
                quantity: newQty,
                quantity_cart_item: newQty,
                line_total: lineTotal,
                total_item: lineTotal,
              };
            }
            return item;
          });
        } else {
          const itemPrice = Number(price || 0);
          const optimisticItem = normalizeCartItem({
            id: `temp-${Date.now()}`,
            cart_item_id: null,
            product_variant_id: targetVariantId,
            variantId: targetVariantId,
            product_id: Number(productId || 0),
            name_product: title || 'Sản phẩm Gritmode',
            title: title || 'Sản phẩm Gritmode',
            price: itemPrice,
            quantity: qty,
            quantity_cart_item: qty,
            image: image || '',
            variant: variant || '',
            line_total: itemPrice * qty,
            total_item: itemPrice * qty,
          });
          optimisticItems = [optimisticItem, ...prevItems];
        }

        const optimisticTotalItems = optimisticItems.reduce((acc, i) => acc + i.quantity, 0);
        const optimisticSubtotal = optimisticItems.reduce((acc, i) => acc + i.line_total, 0);

        set({
          items: optimisticItems,
          summary: { total_items: optimisticTotalItems, subtotal: optimisticSubtotal },
          isDrawerOpen: true,
          isMutating: true,
        });

        // 2. Synchronize with Backend
        try {
          const res = await addToCartApi({
            product_variant_id: targetVariantId,
            quantity: qty,
          });

          const data = res.data?.data || res.data;
          get().setCartFromResponse(data);
          toast.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`);
          return { success: true, data };
        } catch (err) {
          // Rollback on Failure
          set({
            items: prevItems,
            summary: prevSummary,
          });

          const status = err.response?.status;
          if (status === 409) {
            const avail = err.response?.data?.data?.available_quantity;
            toast.error(
              avail !== undefined
                ? `Số lượng yêu cầu vượt quá tồn kho (Hiện còn ${avail} sản phẩm).`
                : 'Sản phẩm này tạm thời không đủ số lượng tồn kho.'
            );
          } else {
            toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
          }
          return { success: false, error: err };
        } finally {
          set({ isMutating: false });
        }
      },

      // Update Quantity of a Cart Item
      updateQuantity: async (cartItemIdOrVariantId, quantity) => {
        const item = get().items.find(
          (i) => i.cart_item_id === cartItemIdOrVariantId || i.product_variant_id === cartItemIdOrVariantId || i.id === cartItemIdOrVariantId
        );

        if (!item) return;

        const cartItemId = item.cart_item_id || item.id;
        const targetQuantity = Number(quantity);

        if (targetQuantity <= 0) {
          return get().removeItem(cartItemId);
        }

        set((state) => ({
          updatingItemIds: [...state.updatingItemIds, cartItemId],
        }));

        try {
          const res = await updateCartItemApi(cartItemId, targetQuantity);
          const data = res.data?.data || res.data;
          get().setCartFromResponse(data);
        } catch (err) {
          if (err.response?.status === 409) {
            toast.error('Số lượng vượt quá tồn kho khả dụng.');
          } else if (err.response?.status === 404) {
            // Item was removed elsewhere, refetch cart
            get().fetchCart();
          } else {
            toast.error(err.response?.data?.message || 'Không thể cập nhật số lượng.');
          }
        } finally {
          set((state) => ({
            updatingItemIds: state.updatingItemIds.filter((id) => id !== cartItemId),
          }));
        }
      },

      // Remove an item
      removeItem: async (cartItemIdOrVariantId) => {
        const item = get().items.find(
          (i) => i.cart_item_id === cartItemIdOrVariantId || i.product_variant_id === cartItemIdOrVariantId || i.id === cartItemIdOrVariantId
        );

        if (!item) return;
        const cartItemId = item.cart_item_id || item.id;

        set((state) => ({
          removingItemIds: [...state.removingItemIds, cartItemId],
        }));

        try {
          const res = await removeCartItemApi(cartItemId);
          const data = res.data?.data || res.data;
          get().setCartFromResponse(data);
          toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
        } catch (err) {
          if (err.response?.status === 404) {
            get().fetchCart();
          } else {
            toast.error(err.response?.data?.message || 'Không thể xóa sản phẩm.');
          }
        } finally {
          set((state) => ({
            removingItemIds: state.removingItemIds.filter((id) => id !== cartItemId),
          }));
        }
      },

      // Clear all items
      clearCart: async () => {
        set({ isMutating: true });
        try {
          await clearCartApi();
          set({
            items: [],
            summary: { total_items: 0, subtotal: 0 },
          });
          toast.info('Đã dọn sạch giỏ hàng.');
        } catch {
          // If clear fails on BE, reset locally
          set({
            items: [],
            summary: { total_items: 0, subtotal: 0 },
          });
        } finally {
          set({ isMutating: false });
        }
      },

      // Local Reset
      resetCartState: () => {
        set({
          cart_id: null,
          status_cart: 'active',
          items: [],
          summary: { total_items: 0, subtotal: 0 },
        });
      },

      // Getters
      getTotalItems: () => {
        const summary = get().summary;
        if (summary && typeof summary.total_items === 'number') {
          return summary.total_items;
        }
        return get().items.reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getTotalPrice: () => {
        const summary = get().summary;
        if (summary && typeof summary.subtotal === 'number') {
          return summary.subtotal;
        }
        return get().items.reduce((total, item) => total + (item.line_total || item.price * item.quantity), 0);
      },

      getSubtotal: () => {
        return get().getTotalPrice();
      },
    }),
    {
      name: 'gritmode-cart-storage',
      partialize: (state) => ({
        cart_id: state.cart_id,
        items: state.items,
        summary: state.summary,
        guestToken: state.guestToken,
      }),
    }
  )
);
