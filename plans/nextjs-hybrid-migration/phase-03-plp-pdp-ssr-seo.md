# Phase 03: SSR & Dynamic Metadata cho PLP & PDP

**Phase ID:** `phase-03-plp-pdp-ssr-seo`  
**Stories Mapped:** FR-04, FR-05, NFR-02 (P2)  
**Status:** passing

---

## 1. Mục tiêu
Chuyển đổi trang Danh sách sản phẩm (PLP - `/products`) và Chi tiết sản phẩm (PDP - `/products/[id]`) sang mô hình SSR Hydration, đồng thời khai báo Dynamic Metadata (`generateMetadata`) để tối ưu hóa SEO và thẻ OpenGraph khi chia sẻ liên kết trên mạng xã hội.

---

## 2. Nhiệm vụ cụ thể
- [x] **2.1 PLP Route (`src/app/(public)/products/page.jsx`):**
  - Đọc `searchParams` trên server để prefetch danh sách sản phẩm theo trang, danh mục, sắp xếp.
  - Sử dụng `<HydrationBoundary state={dehydrate(queryClient)}>` bọc Client Component `ProductListPage` trong `<Suspense>`.
  - Thay thế `useSearchParams` từ `react-router-dom` bằng `next/navigation` (`useSearchParams`, `useRouter`, `usePathname`).
- [x] **2.2 PDP Route (`src/app/(public)/products/[id]/page.jsx`):**
  - Implement `generateMetadata({ params })`: Fetch chi tiết sản phẩm trên server để trả về title (Tên sản phẩm), description (mô tả ngắn), và openGraph image (ảnh Cloudinary sản phẩm).
  - Server prefetch dữ liệu sản phẩm theo `id` (hoặc `slug`).
  - Render `ProductDetailPage` bọc trong `HydrationBoundary`.
- [x] **2.3 Client Interactive Features trong PDP:**
  - Bộ chọn biến thể (size, màu sắc), số lượng, nút thêm vào giỏ hàng tiếp tục vận hành dưới dạng Client Component với Zustand `useCartStore`.
  - Chuyển đổi toàn bộ `useNavigate`, `useLocation` trong tính năng sản phẩm sang `next/navigation`.

---

## 3. Files & Modules bị ảnh hưởng
- `src/app/products/page.jsx` (Mới - Server Component)
- `src/app/products/[id]/page.jsx` (Mới - Server Component)
- `src/features/products/pages/ProductListPage.jsx`
- `src/features/products/pages/ProductDetailPage.jsx`
- `src/features/products/components/*`

---

## 4. Dependencies
- Phụ thuộc: `phase-02-hydration-and-landing-page`

---

## 5. Tiêu chí nghiệm thu (Tests & Acceptance)
- Thẻ `<title>` và `<meta property="og:image">` trên trang chi tiết sản phẩm hiển thị chính xác theo sản phẩm cụ thể khi inspect head HTML từ server.
- Chức năng lọc danh mục, tìm kiếm, phân trang trên `/products` hoạt động trơn tru qua URL params mà không reload trang.
- Thêm sản phẩm vào giỏ hàng từ trang PDP cập nhật giỏ hàng tức thì (Zustand + TanStack Query cache).
