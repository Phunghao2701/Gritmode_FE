# Spec: Realtime Search Modal & Loại bỏ toàn bộ Fallback Data

**Date:** 2026-09-25
**Status:** Ready

---

## Problem Statement

Hiện tại, Search Modal tại Header (`MainLayout.jsx`) chưa có tính năng tìm kiếm realtime — người dùng phải gõ và bấm Enter để chuyển trang sang `/products?search=...`. Đồng thời, hệ thống vẫn còn tồn tại các dữ liệu mẫu/fallback tĩnh (Unsplash URL, hardcoded search tags) thay vì sử dụng 100% dữ liệu thực từ Database.

---

## User Stories

- **[P1]** As a shopper, I want to see real-time product search results inside the search modal as I type, so that I can quickly find and navigate to the item without a full page reload.
  - Accepted when: Typing ≥ 2 characters triggers an automatic debounced (300ms) query displaying up to 6 matching products with thumbnail, title, and formatted price.
- **[P1]** As a shopper, I want to see empty states when no products match, so that I know my query yielded zero items.
  - Accepted when: An empty state message is shown if results array is empty, with a link to view all products.
- **[P1]** As a product owner, I want all mock/fallback data (hardcoded search tags, Unsplash demo photos) removed from the frontend, so that the application runs purely on production database records.
  - Accepted when: Search modal tags are derived from active DB categories, and Unsplash URLs in `LandingPage` and `cartStore` are completely eliminated.
- **[P2]** As a shopper, I want to press Enter or click "Xem tất cả kết quả" to go to the full product catalog filtered by my search query.
  - Accepted when: Submitting the form navigates to `/products?search={query}` and closes the search overlay.

---

## Functional Requirements

1. **FR-01 (Realtime Search Input):** In `MainLayout.jsx`, implement debounced search state (300ms). When `searchQuery.trim().length >= 2`, trigger `useProducts({ search: debouncedQuery, limit: 6 })`.
2. **FR-02 (Live Search Results Dropdown/Grid):** Render live results inside the search overlay:
   - Loading indicator / skeleton during search.
   - List of product items: image, product name, formatted price (VND), and category badge.
   - Clicking a result navigates to `/products/[id]` and closes the modal.
3. **FR-03 (View All CTA):** If total products > 0, show a button "Xem tất cả {total} kết quả cho '{query}'" routing to `/products?search={query}`.
4. **FR-04 (Dynamic Search Tags):** Replace hardcoded tags in `MainLayout.jsx` with real categories fetched via `useCategories()`. Clicking a tag populates the search input or routes directly to that category.
5. **FR-05 (Remove Unsplash Fallback in LandingPage):** Remove the Unsplash fallback object `{ id: 'fallback', image: 'https://images.unsplash...' }` in `LandingPage.jsx`.
6. **FR-06 (Remove Unsplash Fallback in CartStore):** In `cartStore.js`, remove default Unsplash image fallback.

---

## Non-Functional Requirements

- **Performance:** Debounce delay at 300ms to eliminate unnecessary API requests. Response rendered within < 200ms once API returns.
- **Accessibility:** Search modal traps focus or auto-focuses input; pressing `Escape` closes the search overlay.
- **Visual Design:** Dark high-contrast aesthetic matching Gritmode design tokens, glassmorphism backdrop (`backdrop-blur-2xl bg-black/90`).

---

## Success Criteria

- [ ] Typing in Header Search modal displays live matching products within 300-500ms without page reload.
- [ ] Clicking any search result card routes directly to that product detail page.
- [ ] No hardcoded Unsplash fallback URLs exist in `LandingPage.jsx` or `cartStore.js`.
- [ ] Search suggestions tags are dynamically generated from real Database categories.

---

## Out of Scope

- ElasticSearch / Algolia external search engines (Postgres ILIKE / Full-text search with Redis cache is already sufficient).
- Search history stored in user account database (can be local session only if needed).

---

## Assumptions

- Backend API `/api/v1/products?search=...&limit=6` is already functional and returns paginated products.
- Category API `/api/v1/categories` provides active categories to display as search tags.
