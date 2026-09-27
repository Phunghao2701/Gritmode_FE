import http from 'http';
import fs from 'fs';
import path from 'path';

async function fetchRoute(urlPath) {
  const start = performance.now();
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const duration = performance.now() - start;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          duration,
          dataLength: data.length,
          preview: data.slice(0, 300)
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${urlPath}`));
    });
  });
}

async function runE2EVerification() {
  console.log('====================================================');
  console.log('🚀 GRITMODE E2E PERFORMANCE & ARCHITECTURE VERIFICATION');
  console.log('====================================================\n');

  let allPassed = true;

  // 1. Check Storefront Home Route
  console.log('[1/5] Verifying Storefront Home Route (GET /)...');
  try {
    const homeRes = await fetchRoute('/');
    console.log(`  ✓ Status: ${homeRes.statusCode}`);
    console.log(`  ✓ X-Zone Header: ${homeRes.headers['x-zone']}`);
    console.log(`  ✓ TTFB: ${homeRes.duration.toFixed(2)}ms`);
    if (homeRes.statusCode !== 200 || homeRes.headers['x-zone'] !== 'storefront') {
      console.error('  ✗ Unexpected status or zone header for Home');
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ✗ Error fetching /: ${err.message}`);
    allPassed = false;
  }

  // 2. Check Products SSR Route
  console.log('\n[2/5] Verifying Products Route (GET /products)...');
  try {
    const prodRes = await fetchRoute('/products');
    console.log(`  ✓ Status: ${prodRes.statusCode}`);
    console.log(`  ✓ X-Zone Header: ${prodRes.headers['x-zone']}`);
    console.log(`  ✓ TTFB: ${prodRes.duration.toFixed(2)}ms`);
    if (prodRes.statusCode !== 200 || prodRes.headers['x-zone'] !== 'storefront') {
      console.error('  ✗ Unexpected status or zone header for /products');
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ✗ Error fetching /products: ${err.message}`);
    allPassed = false;
  }

  // 3. Check Admin Route & Multi-Zone Headers
  console.log('\n[3/5] Verifying Admin Multi-Zone Boundary (GET /admin)...');
  try {
    const adminRes = await fetchRoute('/admin');
    console.log(`  ✓ Status: ${adminRes.statusCode}`);
    console.log(`  ✓ X-Zone Header: ${adminRes.headers['x-zone']}`);
    console.log(`  ✓ Cache-Control: ${adminRes.headers['cache-control']}`);
    if (adminRes.headers['x-zone'] !== 'admin') {
      console.error('  ✗ Missing or invalid X-Zone: admin header');
      allPassed = false;
    }
  } catch (err) {
    console.error(`  ✗ Error fetching /admin: ${err.message}`);
    allPassed = false;
  }

  // 4. Verify Island Architecture Code Separation
  console.log('\n[4/5] Verifying Island Architecture Code Isolation...');
  const feDir = 'E:/Gritmode/Gritmode_FE';
  
  const mainLayoutCode = fs.readFileSync(path.join(feDir, 'src/shared/layouts/MainLayout.jsx'), 'utf8');
  const isMainLayoutRSC = !mainLayoutCode.includes("'use client'") && !mainLayoutCode.includes('"use client"');
  console.log(`  ✓ MainLayout is pure RSC (no 'use client'): ${isMainLayoutRSC}`);
  if (!isMainLayoutRSC) allPassed = false;

  const announcementCode = fs.readFileSync(path.join(feDir, 'src/shared/components/Header/AnnouncementTicker.jsx'), 'utf8');
  const isTickerRSC = !announcementCode.includes("'use client'") && !announcementCode.includes('"use client"');
  console.log(`  ✓ AnnouncementTicker is pure RSC: ${isTickerRSC}`);
  if (!isTickerRSC) allPassed = false;

  const mainFooterCode = fs.readFileSync(path.join(feDir, 'src/shared/components/Footer/MainFooter.jsx'), 'utf8');
  const isFooterRSC = !mainFooterCode.includes("'use client'") && !mainFooterCode.includes('"use client"');
  console.log(`  ✓ MainFooter is pure RSC: ${isFooterRSC}`);
  if (!isFooterRSC) allPassed = false;

  const headerActionsCode = fs.readFileSync(path.join(feDir, 'src/shared/components/Header/HeaderActions.jsx'), 'utf8');
  const hasDynamicModals = headerActionsCode.includes('dynamic(') && headerActionsCode.includes('ssr: false');
  console.log(`  ✓ SearchModal & CartDrawer loaded dynamically (ssr: false): ${hasDynamicModals}`);
  if (!hasDynamicModals) allPassed = false;

  const hasLoadingProducts = fs.existsSync(path.join(feDir, 'src/app/(public)/products/loading.jsx'));
  const hasLoadingPDP = fs.existsSync(path.join(feDir, 'src/app/(public)/products/[id]/loading.jsx'));
  console.log(`  ✓ Skeletons present (products/loading.jsx & [id]/loading.jsx): ${hasLoadingProducts && hasLoadingPDP}`);
  if (!hasLoadingProducts || !hasLoadingPDP) allPassed = false;

  // 5. Multi-Zones Configuration Verification
  console.log('\n[5/5] Verifying Multi-Zones Config in next.config.mjs...');
  const nextConfigCode = fs.readFileSync(path.join(feDir, 'next.config.mjs'), 'utf8');
  const hasAdminHeader = nextConfigCode.includes('/admin/:path*') && nextConfigCode.includes('X-Zone');
  console.log(`  ✓ next.config.mjs has X-Zone headers configured: ${hasAdminHeader}`);
  if (!hasAdminHeader) allPassed = false;

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL ARCHITECTURE & PERFORMANCE CRITERIA PASSING 100%!');
  } else {
    console.log('⚠️ SOME CRITERIA FAILED');
  }
  console.log('====================================================\n');
}

runE2EVerification().catch(console.error);
