# Phase 03 — Instant Navigation & Parallel Streaming Prefetch

**Phase ID:** `phase-03-instant-navigation-streaming`  
**Priority:** P1 (Covers spec story: [P1] Instant Route Transitions, FR-02, FR-03, NFR-01)

## Objective
Eliminate route transition delays between Trang chủ ↔ `/products` and `/products/[id]` by creating Next.js Instant Loading UI (`loading.jsx` skeletons) and parallelizing server-side React Query prefetching with `Promise.all`.

## Scope & Tasks
1. **Instant Loading Skeletons (`loading.jsx`)**:
   - Create `src/app/(public)/products/loading.jsx`: Renders an immediate skeleton mimicking the PLP layout (breadcrumb, category filter chips, and 8-item product grid pulse animation).
   - Create `src/app/(public)/products/[id]/loading.jsx`: Renders an immediate skeleton for the PDP layout (left thumbnail carousel + right title/price/size-selector/add-to-cart pulse placeholder).
2. **Parallelize SSR Prefetching**:
   - In `src/app/(public)/products/page.jsx`, refactor the two sequential `await queryClient.prefetchQuery(...)` calls into a single `await Promise.all([...])` execution.
   - Ensure errors during server prefetching are caught gracefully with empty defaults so server rendering never throws a 500 error.
3. **Optimistic Route Transitions**:
   - Verify that clicking any product link or navigation menu item immediately paints the skeleton UI within < 50ms without freezing the active page.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_FE\src\app\(public)\products\loading.jsx` (New)
- `e:\Gritmode\Gritmode_FE\src\app\(public)\products\[id]\loading.jsx` (New)
- `e:\Gritmode\Gritmode_FE\src\app\(public)\products\page.jsx` (Optimized prefetching)
- `e:\Gritmode\Gritmode_FE\src\app\(public)\products\[id]\page.jsx`

## Dependencies
- Benefits from Phase 01 (B-Tree indexes speed up parallel queries on BE).
- Builds on Phase 02 (RSC Shell prevents layout remounts during route transition).

## Tests & Acceptance Criteria
- Clicking `<Link href="/products">` transitions immediately (< 50ms visual response via `loading.jsx` skeleton).
- Server prefetching executes in parallel, reducing TTFB for `/products` by ~50%.
- No visual flicker or layout shift (CLS < 0.05).
- `npm run build` succeeds with static/dynamic route categorization intact.

## Risks & Notes
- Ensure query keys in server prefetch match the exact query keys in client hooks (`useProducts`, `useCategories`), avoiding double-fetch on mount.
