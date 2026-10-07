import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CACHE_STALE_TIME,
  invalidateAdminOperationalQueries,
  invalidateOrderQueries,
  withPublicCacheBuster,
} from './cachePolicy.js';

test('critical cache policy uses bounded freshness windows', () => {
  assert.equal(CACHE_STALE_TIME.orderList, 30_000);
  assert.equal(CACHE_STALE_TIME.orderDetail, 10_000);
  assert.equal(CACHE_STALE_TIME.payment, 5_000);
  assert.equal(CACHE_STALE_TIME.adminNotifications, 30_000);
});

test('order invalidation covers string and numeric query-key variants', () => {
  const calls = [];
  const queryClient = { invalidateQueries: (options) => calls.push(options.queryKey) };

  invalidateOrderQueries(queryClient, '42');

  assert.deepEqual(calls, [
    ['my-orders'],
    ['order-detail', '42'],
    ['order-payment', '42'],
    ['order-detail', 42],
    ['order-payment', 42],
  ]);
});

test('admin operational invalidation covers list, detail, and aggregates', () => {
  const calls = [];
  const queryClient = { invalidateQueries: (options) => calls.push(options.queryKey) };

  invalidateAdminOperationalQueries(queryClient);

  assert.deepEqual(calls, [
    ['admin-orders'],
    ['admin-order-detail'],
    ['admin-dashboard-overview'],
    ['admin-stats'],
  ]);
});

test('public cache buster preserves filters and produces a new value', () => {
  const first = withPublicCacheBuster({ collection: 'summer', page: 2 });
  const second = withPublicCacheBuster({ collection: 'summer', page: 2 });

  assert.deepEqual(first, { collection: 'summer', page: 2, _cache: first._cache });
  assert.notEqual(first._cache, second._cache);
});
