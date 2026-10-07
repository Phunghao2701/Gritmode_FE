export const CACHE_STALE_TIME = Object.freeze({
  orderList: 30_000,
  orderDetail: 10_000,
  payment: 5_000,
  adminOrders: 15_000,
  adminNotifications: 30_000,
  adminDashboard: 60_000,
  products: 3 * 60_000,
  categories: 30 * 60_000,
  collections: 30 * 60_000,
  banners: 5_000,
});

let publicCacheBusterSequence = 0;

/**
 * Public catalog data is mutable from the admin console. Keep a changing
 * query value on every catalog GET so a response cached before the no-store
 * policy was deployed can never be reused by the browser.
 */
export const withPublicCacheBuster = (params = {}) => ({
  ...params,
  _cache: `${Date.now()}-${++publicCacheBusterSequence}`,
});

export const invalidateOrderQueries = (queryClient, orderId) => {
  queryClient.invalidateQueries({ queryKey: ['my-orders'] });

  if (orderId !== undefined && orderId !== null) {
    const ids = new Set([orderId, String(orderId)]);
    const numericId = Number(orderId);
    if (Number.isSafeInteger(numericId)) ids.add(numericId);
    ids.forEach((id) => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['order-payment', id] });
    });
  } else {
    queryClient.invalidateQueries({ queryKey: ['order-detail'] });
    queryClient.invalidateQueries({ queryKey: ['order-payment'] });
  }
};

export const invalidateAdminOperationalQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
  queryClient.invalidateQueries({ queryKey: ['admin-order-detail'] });
  queryClient.invalidateQueries({ queryKey: ['admin-dashboard-overview'] });
  queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
};

export const invalidateCriticalQueries = (queryClient) => {
  invalidateOrderQueries(queryClient);
  invalidateAdminOperationalQueries(queryClient);
  queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
};
