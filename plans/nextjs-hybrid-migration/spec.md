# Spec: Chuyển đổi Gritmode_FE sang Next.js 15 (Mô hình lai SSR & CSR Hydration)
**Date:** 2026-09-25
**Status:** Ready

## Problem Statement
Ứng dụng frontend hiện tại của Gritmode chạy thuần CSR trên Vite 8, dẫn đến hạn chế về SEO, thẻ OpenGraph preview trên mạng xã hội và tốc độ hiển thị nội dung đầu tiên (LCP/FCP) cho các trang thương mại quan trọng (Landing, Danh sách sản phẩm, Chi tiết sản phẩm). Việc chuyển đổi sang Next.js 15 App Router với mô hình lai SSR & CSR Hydration bằng TanStack Query v5 sẽ tối ưu hóa toàn diện hiệu năng và SEO mà vẫn giữ trọn vẹn trải nghiệm tương tác mượt mà và bảo mật token in-memory hiện có.

## User Stories
- **[P1] MVP: Nền tảng Next.js 15 App Router & Landing Page Hybrid**
  - Là người dùng ghé thăm Gritmode, tôi muốn Landing Page được render ngay lập tức từ server với HTML đầy đủ dữ liệu banner, danh mục, sản phẩm nổi bật để trải nghiệm load trang nhanh và bot tìm kiếm có thể index.
  - Accepted when: Truy cập URL `/` trả về HTML có sẵn dữ liệu sản phẩm/banner từ backend, không có màn hình trắng hay layout shift, TanStack Query hydrate thành công không lỗi console hydration mismatch.
- **[P2] Mở rộng SEO & Hydration cho PLP & PDP**
  - Là người mua hàng, tôi muốn vào trang danh sách sản phẩm (`/products`) và trang chi tiết sản phẩm (`/products/:slug` hoặc `/products/:id`) với đầy đủ title, description, thẻ OpenGraph hình ảnh khi chia sẻ link mạng xã hội, đồng thời các bộ lọc và giỏ hàng vẫn hoạt động tương tác mượt mà ở client.
  - Accepted when: Trang PLP và PDP sinh thẻ metadata động (`generateMetadata`) chính xác theo sản phẩm/danh mục; bộ lọc, phân trang, nút thêm giỏ hàng hoạt động mượt mà bằng Client Component.
- **[P3] Di dời toàn bộ Route tương tác, Admin & Static Pages**
  - Là quản trị viên hoặc khách hàng đã đăng nhập, tôi muốn các trang `/admin/*`, `/profile`, `/checkout`, `/cart`, `/auth/*`, `/policy/*` hoạt động ổn định với cơ chế bảo vệ quyền truy cập hiện có.
  - Accepted when: Toàn bộ các route được chuyển sang App Router dưới dạng Client Component (`'use client'`), luồng xác thực in-memory token + silent refresh và guards chạy đúng như trên Vite cũ.

## Functional Requirements
- **FR-01 (App Router Setup):** Cấu hình Next.js 15 song hành cùng React 19, thay thế Vite build, thiết lập `src/app/layout.jsx` tích hợp font, Tailwind CSS v3, và root client providers (TanStack Query, Toast, Lenis Smooth Scroll wrapper).
- **FR-02 (Hydration Architecture):** Xây dựng tiện ích khởi tạo `QueryClient` cho server component (`getQueryClient`) và client component (`QueryClientProvider`), hỗ trợ `HydrationBoundary` nhận `dehydrate(queryClient)`.
- **FR-03 (Landing Page SSR):** Chuyển đổi Landing Page thành Server Component thực hiện prefetch các query danh mục, banner, sản phẩm nổi bật, sau đó truyền vào `HydrationBoundary` bao bọc các Client Component hiển thị.
- **FR-04 (PLP SSR & Interactive Filtering):** Route `/products` prefetch danh sách sản phẩm ban đầu trên Server Component; Client Component đảm nhận xử lý filter/search/pagination với URL query parameters và TanStack Query.
- **FR-05 (PDP SSR & Dynamic Metadata):** Route `/products/[id]` (hoặc `[slug]`) fetch dữ liệu chi tiết sản phẩm trên server để xuất thẻ `generateMetadata` (OpenGraph title, image Cloudinary, description) và prefetch dữ liệu cho trang chi tiết.
- **FR-06 (Client Guards & Private Routes):** Chuyển đổi `ProtectedRoute` và `AdminRoute` thành Client Components bọc các trang nhạy cảm (`/admin/*`, `/profile`, `/checkout`), giữ nguyên Zustand `authStore` và cơ chế silent refresh token.
- **FR-07 (Image Optimization):** Cấu hình `next.config.mjs` với `remotePatterns` cho Cloudinary (`res.cloudinary.com`) để hỗ trợ tối ưu hình ảnh qua `next/image` hoặc fallback `<img>`.
- **FR-08 (API Client Dual-Mode):** Tinh chỉnh client API (Axios/Fetch) để hỗ trợ gọi API từ cả môi trường Node.js (Server Components) và môi trường Browser (Client Components).

## Non-Functional Requirements
- **NFR-01 (Hydration Reliability):** 0 lỗi `Hydration failed` hay `Text content did not match` trong Dev console trên mọi route SSR.
- **NFR-02 (Performance):** LCP (Largest Contentful Paint) của Landing page và PDP đạt ≤ 1.8s trong môi trường mạng tiêu chuẩn; điểm Lighthouse SEO ≥ 90.
- **NFR-03 (Zero Feature Regression):** 100% tính năng hiện tại (auth, cart, search, filter, checkout, payment, admin CRUD, Google OAuth) hoạt động bình thường sau khi chuyển đổi.
- **NFR-04 (Build Stability):** Lệnh `npm run build` của Next.js hoàn thành thành công mà không có type/lint/module resolution errors.

## Success Criteria
- [ ] Chạy thành công `npm run dev` và `npm run build` trên Next.js 15 mà không phát sinh lỗi.
- [ ] Landing page hiển thị dữ liệu server-rendered ngay trong source HTML (kiểm tra bằng View Source / curl).
- [ ] PLP và PDP render SSR với đầy đủ OpenGraph metadata và hydrate mượt mà vào TanStack Query.
- [ ] Luồng đăng nhập, silent refresh token, protected route và admin dashboard hoạt động chính xác mà không cần sửa Backend.
- [ ] Các thành phần client (giỏ hàng, filter, dialog, Lenis scroll) hoạt động bình thường, không crash runtime.

## Out of Scope
- Không thay đổi hoặc tái cấu trúc backend API (`Gritmode_BE`).
- Không áp dụng Next.js Edge Middleware cho Auth (giữ nguyên Client-side guard).
- Không chuyển đổi toàn bộ admin dashboard sang SSR (Admin giữ nguyên Client-side rendering).

## Assumptions
- Backend `Gritmode_BE` có sẵn và có thể truy cập được từ Next.js server (Node.js runtime) qua `process.env.INTERNAL_API_URL` hoặc `NEXT_PUBLIC_API_URL`.
- Refresh token tiếp tục được trình duyệt gửi tự động qua HttpOnly cookie tới backend khi gọi client requests.
- Hình ảnh sản phẩm được host trên Cloudinary và tuân thủ các pattern URL thông dụng.
