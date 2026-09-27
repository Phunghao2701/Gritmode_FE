# Phase 01 — Clean Navigation & Local Skeleton UI

**Phase ID:** `phase-01-clean-navigation-local-loading`  
**Priority:** P1 (Covers spec stories: User Story 1, User Story 2)

## Objective
Eliminate the intermediate URL flickering upon navigation and refine `products/loading.jsx` into a zero-layout-shift local skeleton where breadcrumbs, page title, and category filter pills remain static while only the product card grid pulses.

## Scope & Implementation Tasks
1. **Fix Homepage Navigation Target**:
   - In `src/features/landing/pages/LandingPage.jsx`:
     - Update Hero banner `onClick` from `router.push('/products?sort=newest')` to `router.push('/products')`.
     - Ensure all other CTAs pointing to products use clean `/products` path.
2. **Prevent Initial Mount URL Rewrite**:
   - In `src/features/products/pages/ProductListPage.jsx`:
     - Check `updateUrlParams` and initial `useEffect`: do NOT trigger `router.replace` if incoming parameters are empty or match system defaults (`sort: 'newest'`).
     - Ensure browser address bar updates only once on explicit user interaction.
3. **Refine Instant Skeleton Layout**:
   - In `src/app/(public)/products/loading.jsx`:
     - Render authentic streetwear page header: Breadcrumbs ("Trang chủ / Sản phẩm") and Title ("TẤT CẢ SẢN PHẨM").
     - Render static Category Filter Pills corresponding to primary categories so the toolbar does not flash or jump.
     - Confine animated pulsing effect strictly to the 8 Product Card slots with matching aspect ratio (`3/4`).

## Files & Modules Affected
- `e:\Gritmode\Gritmode_FE\src\features\landing\pages\LandingPage.jsx`
- `e:\Gritmode\Gritmode_FE\src\features\products\pages\ProductListPage.jsx`
- `e:\Gritmode\Gritmode_FE\src\app/(public)/products/loading.jsx`

## Dependencies
- None (Phase 01 is independent).

## Tests & Acceptance Criteria
- Clicking Hero banner navigates directly to `/products` with exactly 1 URL transition (0 redirects, 0 address bar flickers).
- Navigating to `/products` renders page title and filter pills statically; product card grid displays 8 shimmer placeholder cards.
- Replacing skeleton with live SSR products causes zero layout shift (CLS = 0).

## Risks & Notes
- Keep skeleton markup dark-mode and light-mode compliant using Tailwind classes (`bg-neutral-200 dark:bg-neutral-800`).
