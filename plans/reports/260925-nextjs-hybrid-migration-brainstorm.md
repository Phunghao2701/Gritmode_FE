# Brainstorm: Chuyển đổi Gritmode_FE sang Next.js 15 (Mô hình lai SSR & CSR Hydration)

**Date:** 2026-09-25

## Ideas Explored
- **Framework & Router:**
  - *Next.js Pages Router (`getServerSideProps`):* Cũ hơn, quen thuộc nhưng dần bị thay thế, không tận dụng được React Server Components (RSC) của React 19.
  - *Next.js App Router (RSC + Client Components - Được chọn):* Kiến trúc hiện đại, tương thích tự nhiên với React 19, cho phép chia tách rành mạch Server Component (không gửi JS về client) và Interactive Client Islands (`'use client'`).
- **Chiến lược phân bổ Rendering:**
  - *Full CSR (Vite hiện tại):* Nhanh cho tương tác nội bộ, nhưng yếu về SEO, không có thẻ OpenGraph động khi share link và thời gian chờ TTFB/LCP ban đầu phụ thuộc vào việc tải bundle JS lớn.
  - *Full SSR/SSG:* Khó đáp ứng dynamic state giỏ hàng, auth check, filter phức tạp, dashboard admin.
  - *Hybrid SSR & CSR (Được chọn):* SSR prefetch ở Server Component cho các trang public/SEO (Landing, PLP, PDP) và CSR cho các trang/thành phần tương tác cao (Cart, Checkout, Admin, Auth guard).
- **Mô hình Hydration Data Fetching:**
  - *Hướng A (Props thuần):* Server fetch và truyền qua props thuần vào Client Component. Ít boilerplate nhưng client không tận dụng được caching/deduping sẵn có của TanStack Query khi filter/paginate.
  - *Hướng B (TanStack Query v5 Hydration - Được chọn):* Server prefetch query vào queryClient cache, bọc qua `<HydrationBoundary state={dehydrate(queryClient)}>`. Client component tái sử dụng cache tức thì mà không cần refetch lại, duy trì đầy đủ tính năng caching/staleTime/background refetch.
- **Phương án Migration:**
  - *Lựa chọn A (In-place Migration - Được chọn):* Refactor trực tiếp trên repo `Gritmode_FE` hiện tại để giữ git history, tái sử dụng toàn bộ components, styling Tailwind v3, utils và services.
  - *Lựa chọn B (Khởi tạo repo mới rồi copy):* Bị loại bỏ vì gây đứt gãy git history và tốn công thiết lập lại tooling.
- **Cơ chế Bảo vệ Route & Auth:**
  - *Phương án 1 (CSR Client Guard - Được chọn):* Giữ nguyên Token In-Memory + HttpOnly Refresh Cookie với CSR Client Guard (`ProtectedRoute`, `AdminRoute`), không cần thay đổi hay can thiệp vào `Gritmode_BE`.
  - *Phương án 2 (Next.js Middleware + Cookie):* Bị loại bỏ do yêu cầu phải sửa đổi backend authentication cookie.

## User's Direction
- Chọn Next.js App Router song hành cùng React 19.
- Áp dụng SSR cho Landing Page, Product List Page (PLP) và Product Detail Page (PDP) để tối ưu hóa SEO và LCP.
- Dùng mô hình Hướng B: TanStack Query Hydration (`HydrationBoundary` + `dehydrate`).
- In-place Migration trực tiếp trên repo `Gritmode_FE`.
- Giữ nguyên cơ chế Auth hiện tại ở Client (không đổi BE).
- Quản lý media/ảnh sản phẩm qua Cloudinary (`res.cloudinary.com`).
- Phân kỳ triển khai theo 3 giai đoạn: P1 (MVP Landing + Foundation), P2 (PLP & PDP SSR + dynamic metadata), P3 (Remaining routes + Admin).

## Open Questions
- Cấu hình cụ thể `next.config.mjs` cho các remote patterns của Cloudinary.
- Tinh chỉnh Lenis smooth scroll để chỉ chạy ở phía client mà không gây lỗi SSR (`typeof window !== 'undefined'`).
- Tách biệt API endpoint gọi nội bộ (Server-to-Server / Node fetch) và external client URL (`NEXT_PUBLIC_API_URL`).

## Risks
- **Hydration Mismatch:** Do extension trình duyệt hoặc sai lệch thời gian/state giữa server render và client hydration (cần cẩn trọng với `typeof window`, `localStorage` hoặc dynamic date).
- **Client component leakage:** Import các thư viện phụ thuộc DOM/browser vào Server Component gây vỡ build server.
- **Lenis Smooth Scroll / Window Events:** Các module tương tác DOM sâu cần được gói cẩn thận trong các Client Provider hoặc dynamic import với `ssr: false`.
