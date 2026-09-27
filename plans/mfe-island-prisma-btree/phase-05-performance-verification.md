# Phase 05 — Performance Verification & End-to-End Regression Audit

**Phase ID:** `phase-05-performance-verification`  
**Priority:** P1 (Covers spec story: Acceptance & Verification, NFR-01, NFR-02, NFR-03, NFR-04)

## Objective
Execute a comprehensive performance audit and regression test suite across Frontend and Backend: verify INP < 150ms, TTFB < 20ms on indexed queries, client JS bundle reduction >= 35%, and confirm zero regressions on cart, auth, checkout, and MinIO image loading.

## Scope & Tasks
1. **Database & Index Verification (Backend)**:
   - Run `EXPLAIN ANALYZE` on core query patterns:
     - `SELECT * FROM product WHERE category_id = $1 ORDER BY created_at DESC LIMIT 20;`
     - `SELECT * FROM product WHERE slug_product = $1;`
   - Confirm B-Tree Index Scan is used and execution time is < 10ms.
2. **Bundle Size & Hydration Audit (Frontend)**:
   - Run production build: `npm run build`.
   - Compare First Load JS shared by all routes: confirm >= 35% decrease from baseline.
   - Verify 0 hydration error logs in browser console.
3. **Core Web Vitals & Transition Verification**:
   - Audit INP (Interaction to Next Paint) on mobile and desktop: target < 150ms.
   - Test route transition between Home ↔ `/products`: verify instant skeleton paint with no UI freeze.
4. **End-to-End Functional Regression**:
   - Test Guest & User Cart: Add to cart, open dynamic Cart Drawer, update quantity, remove item.
   - Test Search Modal: Open dynamic Search Modal, debounced live search query, navigate to result.
   - Test MinIO Images: Verify all product thumbnails and hero banners display cleanly without 400 errors.
   - Run backend test suite: `npm test` in `Gritmode_BE`.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_BE\tests\`
- `e:\Gritmode\Gritmode_FE\tests\` (Smoke & Performance checks)

## Dependencies
- Requires Phases 01, 02, 03, 04 complete.

## Tests & Acceptance Criteria
- All backend tests (`npm test` in `Gritmode_BE`) pass with 0 failures.
- `EXPLAIN ANALYZE` confirms B-Tree Index Scan (< 10ms).
- Production build succeeds cleanly (`npm run build`).
- End-to-end checkout, auth, and cart flows operate smoothly without console errors.

## Risks & Notes
- Document all before-and-after metrics in the final summary.
