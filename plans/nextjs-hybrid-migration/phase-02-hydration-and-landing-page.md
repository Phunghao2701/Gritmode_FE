# Phase 02: Hydration Architecture & Landing Page SSR

**Phase ID:** `phase-02-hydration-and-landing-page`  
**Stories Mapped:** FR-03, NFR-01, NFR-02 (P1)  
**Status:** passing

---

## 1. Mục tiêu
Triển khai mô hình Server-Side Rendering (SSR) kết hợp TanStack Query Hydration cho Landing Page (`/`). Đảm bảo dữ liệu hero banner, danh mục sản phẩm, sản phẩm nổi bật được render trực tiếp trong HTML từ server, đồng thời các tương tác phía client (slider, carousel, add to cart, animations) chạy trơn tru mà không có lỗi hydration mismatch.

---

## 2. Nhiệm vụ cụ thể
- [x] **2.1 Server Fetching Helper:** Viết hàm fetch server an toàn cho Landing Page (gọi các API danh mục công khai, sản phẩm nổi bật/mới nhất).
- [x] **2.2 Server Page Implementation (`src/app/(public)/page.jsx`):**
  - Khởi tạo `queryClient = getQueryClient()`.
  - Thực hiện `await queryClient.prefetchQuery(...)` cho các query keys của Landing Page.
  - Dehydrate state qua `<HydrationBoundary state={dehydrate(queryClient)}>`.
- [x] **2.3 Client Interactive Islands:**
  - Chuyển đổi component `LandingPage` hiện có (`src/features/landing/pages/LandingPage.jsx`) thành Client Component (`'use client'`).
  - Đảm bảo các hook `useQuery` trong landing page khớp key và queryFn với server prefetch để tái sử dụng cache ngay lập tức mà không trigger loading skeletons.
- [x] **2.4 Link Migration:** Chuyển đổi các thẻ `<Link>` từ `react-router-dom` sang `next/link` trong toàn bộ thành phần thuộc Landing Page và Header/Footer.
- [x] **2.5 Hydration Mismatch Audit:** Đảm bảo 0 lỗi hydration mismatch trên dev/build console.

---

## 3. Files & Modules bị ảnh hưởng
- `src/app/page.jsx` (Mới - Server Component)
- `src/features/landing/pages/LandingPage.jsx`
- `src/features/landing/components/*`
- `src/shared/components/Header.jsx` (hoặc tương đương)
- `src/shared/components/Footer.jsx`

---

## 4. Dependencies
- Phụ thuộc: `phase-01-setup-nextjs-foundation`

---

## 5. Tiêu chí nghiệm thu (Tests & Acceptance)
- View source trang chủ (`Ctrl + U` hoặc `curl http://localhost:3000`) thấy rõ HTML chứa text và dữ liệu sản phẩm/banner thay vì chỉ có thẻ `<div id="root"></div>` trống.
- Console browser không xuất hiện cảnh báo `Warning: Extra attributes from the server` hoặc `Hydration failed because the initial UI does not match`.
- Các tương tác scroll mượt mà (Lenis), banner carousel, hover sản phẩm hoạt động hoàn hảo.
