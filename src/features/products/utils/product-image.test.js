import test from 'node:test';
import assert from 'node:assert/strict';
import { getProductImageSrcSet, getSizedProductImageUrl } from './product.utils.js';

test('product image URLs request only the rendered size', () => {
  const cloudinary = 'https://res.cloudinary.com/demo/image/upload/v1/products/shirt.webp';
  const unsplash = 'https://images.unsplash.com/photo-1?auto=format&w=1400&sig=1';

  assert.match(getSizedProductImageUrl(cloudinary, 640), /f_auto,q_auto:good,w_640,c_limit/);
  assert.equal(new URL(getSizedProductImageUrl(unsplash, 320)).searchParams.get('w'), '320');
  assert.match(getProductImageSrcSet(cloudinary, [320, 640]), /320w, .*640w$/);
});
