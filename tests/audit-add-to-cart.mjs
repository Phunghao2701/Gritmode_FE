import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

const productMock = {
  product_id: 101,
  name_product: "Gritmode Oversized Heavyweight Tee",
  description: "Premium Streetwear Tee",
  status_product: "active",
  price: 450000,
  min_price: 450000,
  max_price: 450000,
  is_available: true,
  thumbnail: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800",
  images: [
    { product_image_id: 1, url_product_image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800", position_product_image: 1 }
  ],
  options: [
    {
      product_option_id: 1,
      name_option: "Size",
      values: [
        { product_option_value_id: 11, value_option: "L" },
        { product_option_value_id: 12, value_option: "XL" }
      ]
    }
  ],
  variants: [
    {
      product_variant_id: 1001,
      sku: "TEE-L",
      price: 450000,
      effective_price: 450000,
      quantity_available: 50,
      inventory: { quantity_available: 50 },
      option_values: [{ product_option_value_id: 11, name_option: "Size", value_option: "L" }]
    }
  ]
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

const SIMULATED_NETWORK_DELAY_MS = 350;

await page.route('**/api/v1/**', async (route) => {
  const request = route.request();
  const url = request.url();

  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204 });

  if (url.includes('/products/')) {
    return route.fulfill({
      status: 200,
      json: { success: true, data: productMock }
    });
  }

  if (url.includes('/cart/items') && request.method() === 'POST') {
    await new Promise((r) => setTimeout(r, SIMULATED_NETWORK_DELAY_MS));
    return route.fulfill({
      status: 200,
      json: {
        success: true,
        data: {
          cart_id: 999,
          items: [
            {
              cart_item_id: 1,
              product_variant_id: 1001,
              quantity: 1,
              price: 450000,
              line_total: 450000,
              name_product: productMock.name_product,
              image: productMock.thumbnail
            }
          ],
          summary: { total_items: 1, subtotal: 450000 }
        }
      }
    });
  }

  if (url.includes('/cart')) {
    return route.fulfill({
      status: 200,
      json: { success: true, data: { items: [], summary: { total_items: 0, subtotal: 0 } } }
    });
  }

  return route.continue();
});

try {
  await page.goto(`${baseUrl}/products/sample-tee`, { waitUntil: 'networkidle' });

  const addToCartBtn = page.getByRole('button', { name: /THÊM VÀO GIỎ/i });
  await addToCartBtn.waitFor({ state: 'visible', timeout: 5000 });

  let requestStartTime = 0;
  let responseEndTime = 0;

  page.on('request', (req) => {
    if (req.url().includes('/api/v1/cart/items') && req.method() === 'POST') {
      requestStartTime = performance.now();
    }
  });

  page.on('response', (res) => {
    if (res.url().includes('/api/v1/cart/items') && res.request().method() === 'POST') {
      responseEndTime = performance.now();
    }
  });

  const clickTime = performance.now();
  await addToCartBtn.click();

  // Wait for drawer container to become visible in DOM and state
  const closeDrawerBtn = page.locator('button[aria-label="Đóng giỏ hàng"]');
  await closeDrawerBtn.waitFor({ state: 'visible', timeout: 8000 });
  const drawerVisibleTime = performance.now();

  // Wait for network response to complete in background
  await page.waitForResponse((res) => res.url().includes('/api/v1/cart/items') && res.request().method() === 'POST');

  const uiLatency = drawerVisibleTime - clickTime;
  const netDuration = responseEndTime - requestStartTime;

  console.log(`\n======================================================`);
  console.log(`🛒 PLAYWRIGHT AUDIT: ADD TO CART PERFORMANCE (OPTIMISTIC)`);
  console.log(`======================================================`);
  console.log(`• Simulated Network Latency : ${SIMULATED_NETWORK_DELAY_MS} ms`);
  console.log(`• Actual API Roundtrip Time : ${netDuration.toFixed(2)} ms`);
  console.log(`• Click-to-Drawer Visible   : ${uiLatency.toFixed(2)} ms`);
  console.log(`• UI Blocking Bottleneck   : ${uiLatency < netDuration ? '🟢 NONE (Optimistic UI — Drawer opened before API returned)' : '🔴 BLOCKED'}`);
  console.log(`• Speedup Improvement      : ~${(netDuration / uiLatency).toFixed(1)}x faster perceived response`);
  console.log(`======================================================\n`);

} finally {
  await browser.close();
}
