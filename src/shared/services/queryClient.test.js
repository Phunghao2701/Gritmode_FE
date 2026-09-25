import test from 'node:test';
import assert from 'node:assert/strict';
import { clearPrivateQueryCache, queryClient } from './queryClient.js';

test('clearing a failed session keeps public catalog cache', () => {
  queryClient.setQueryData(['products'], ['shirt']);
  queryClient.setQueryData(['categories-public-tree'], ['tops']);
  queryClient.setQueryData(['user-profile'], { id: 1 });
  queryClient.setQueryData(['admin-orders'], [{ id: 1 }]);

  clearPrivateQueryCache();

  assert.deepEqual(queryClient.getQueryData(['products']), ['shirt']);
  assert.deepEqual(queryClient.getQueryData(['categories-public-tree']), ['tops']);
  assert.equal(queryClient.getQueryData(['user-profile']), undefined);
  assert.equal(queryClient.getQueryData(['admin-orders']), undefined);
});
