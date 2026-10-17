import assert from 'node:assert/strict';

const baseUrl = (process.env.PERF_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const routes = ['/', '/products', '/collections'];
const results = [];

for (const route of routes) {
  const startedAt = performance.now();
  let response;
  try {
    response = await fetch(`${baseUrl}${route}`, { redirect: 'manual' });
  } catch (error) {
    throw new Error(`Không thể kết nối ${baseUrl}. Hãy chạy FE trước khi đo performance: ${error.message}`);
  }

  const elapsedMs = Math.round(performance.now() - startedAt);
  assert.ok(response.status >= 200 && response.status < 400, `${route} trả về HTTP ${response.status}`);
  results.push({ route, status: response.status, elapsedMs });
}

console.table(results);
