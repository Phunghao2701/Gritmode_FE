# Phase 02 — Island Architecture Core & Dynamic Modals

**Phase ID:** `phase-02-island-architecture-core`  
**Priority:** P1 (Covers spec story: [P1] Island Architecture & Zero-Delay Interactions, FR-01, FR-04, NFR-01, NFR-03)

## Objective
Refactor the monolithic client layout (`MainLayout.jsx`, 1,152 lines) into a lightweight React Server Component (RSC Shell, 0kb client JS), extract interactive leaf components into isolated Client Islands (`HeaderActions`, `MobileNavToggle`), and convert heavy overlays (`CartDrawer`, `SearchModal`) into lazy dynamic imports (`next/dynamic({ ssr: false })`).

## Scope & Tasks
1. **RSC Layout Decomposition**:
   - Remove `'use client'` from the top-level `MainLayout.jsx`.
   - Render announcement marquee ticker, desktop navigation links, center logo brand, and footer as static RSC markup (0kb client JavaScript sent over the wire).
2. **Interactive Islands Extraction**:
   - Extract `HeaderActions.jsx` as an isolated `'use client'` island: contains Search button trigger, Account link, and Cart item count badge.
   - Extract `MobileNavToggle.jsx` as an isolated `'use client'` island: controls mobile drawer state.
3. **Dynamic Import for Heavy Modals**:
   - Replace direct imports of `CartDrawer` and `SearchModal` with on-demand `next/dynamic(() => import(...), { ssr: false })`.
   - Verify that the JavaScript bundles for search and cart are only fetched when the user triggers them.
4. **Root Provider Optimization**:
   - In `providers.jsx`, ensure `SmoothScrollProvider` RAF loop and `AuthInit` do not block initial hydration or cause main thread thrashing.

## Files & Modules Affected
- `e:\Gritmode\Gritmode_FE\src\shared\layouts\MainLayout.jsx` (Converted to RSC Shell)
- `e:\Gritmode\Gritmode_FE\src\shared\components\Header\HeaderActions.jsx` (New Client Island)
- `e:\Gritmode\Gritmode_FE\src\shared\components\Header\MobileNavToggle.jsx` (New Client Island)
- `e:\Gritmode\Gritmode_FE\src\shared\components\Header\MegaMenu.jsx`
- `e:\Gritmode\Gritmode_FE\src\app\providers.jsx`

## Dependencies
- Independent of Phase 01 (can be developed in parallel).

## Tests & Acceptance Criteria
- `MainLayout.jsx` does NOT have `'use client'` directive at file top.
- Initial client bundle size transferred on homepage load is reduced by >= 35%.
- Clicking the search icon dynamically loads and renders the search modal without errors.
- Clicking the cart bag button dynamically loads and opens the Cart Drawer with live item count.
- Console shows 0 hydration mismatch errors.

## Risks & Notes
- Ensure context providers required by client islands (React Query, Zustand) remain accessible through `providers.jsx`.
