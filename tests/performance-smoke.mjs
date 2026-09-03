import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.PREVIEW_URL || 'http://localhost:4174';
const image = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&q=85';
const products = Array.from({ length: 5 }, (_, index) => ({
  product_id: index + 1,
  name_product: `Product ${index + 1}`,
  thumbnail: `${image}&sig=${index}`,
  min_price: 100000,
  max_price: 100000,
  is_available: true,
}));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3 });
const requests = [];

page.on('request', (request) => requests.push(request.url()));
await page.route('**/api/v1/**', async (route) => {
  const request = route.request();
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });

  const pathname = new URL(request.url()).pathname;
  if (pathname.endsWith('/products')) {
    return route.fulfill({
      json: { data: { items: products, pagination: { page: 1, limit: 20, total: 5, total_pages: 1 } } },
    });
  }
  if (pathname.endsWith('/categories') || pathname.endsWith('/collections')) {
    return route.fulfill({ json: { data: [] } });
  }
  if (pathname.endsWith('/cart')) {
    return route.fulfill({ json: { data: { items: [], summary: { total_items: 0, subtotal: 0 } } } });
  }
  return route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
});

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  assert.equal(requests.filter((url) => /\/auth\/(me|refresh)/.test(url)).length, 0);
  assert.equal(requests.filter((url) => new URL(url).pathname.endsWith('/products')).length, 1);
  assert.ok(await page.locator('main img[fetchpriority="high"]').count());
  assert.ok(await page.locator('main img[srcset]').count());
  assert.ok((await page.locator('main section').first().locator('img').count()) <= 2);
  assert.equal(requests.some((url) => /Admin.+Page/.test(url)), false);

  await page.goto(`${baseUrl}/products`, { waitUntil: 'networkidle' });
  requests.length = 0;
  await page.locator('main input[type="text"]').first().pressSequentially('grit', { delay: 50 });
  await page.waitForTimeout(500);
  assert.equal(requests.filter((url) => url.includes('/products?') && url.includes('search=grit')).length, 1);
  assert.equal(requests.filter((url) => /search=(g|gr|gri)(&|$)/.test(url)).length, 0);
} finally {
  await browser.close();
}

console.log('performance smoke passed');
