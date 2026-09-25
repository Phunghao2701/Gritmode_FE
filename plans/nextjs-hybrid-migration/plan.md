# Plan: Chuyển đổi Gritmode_FE sang Next.js 15 (Mô hình lai SSR & CSR Hydration)

**Date:** 2026-09-25  
**Mode:** --hard  
**Risk:** high-risk — Thay thế hoàn toàn build system Vite và React-Router-DOM sang Next.js 15 App Router trên toàn bộ ứng dụng frontend.  
**Spec Reference:** `plans/nextjs-hybrid-migration/spec.md`

---

## 1. Executive Summary & Architecture Strategy
- **Core Framework:** Next.js 15 (hỗ trợ React 19.2.6 có sẵn trong repo), giữ nguyên Tailwind CSS v3.4.17.
- **Data Hydration:** TanStack Query v5 Server Hydration (`makeQueryClient`, `getQueryClient`, `HydrationBoundary`, `dehydrate`).
- **Rendering Allocation:**
  - **SSR + Hydration:** Landing Page (`/`), Product List (`/products`), Product Detail (`/products/[id]`).
  - **CSR (Client Components):** Cart, Checkout, Auth, User Profile, Admin Dashboard (`/admin/*`), Policies.
- **Auth Strategy:** Giữ nguyên In-memory Access Token + HttpOnly Refresh Token. Sử dụng Client Guards (`ProtectedRoute`, `AdminRoute`) và silent refresh khi component mount. Không sửa đổi Backend `Gritmode_BE`.
- **Directory Restructuring:**
  - Di chuyển `src/app/store` -> `src/shared/store` (tránh xung đột với Next.js App Router).
  - Di chuyển `src/app/layouts` -> `src/shared/layouts`.
  - Thay thế `src/app/routes` bằng cấu trúc thư mục App Router: `src/app/(public)`, `src/app/(shop)`, `src/app/(admin)`.

---

## 2. Research Findings & Technical Standards

### Primary Approach (TanStack Query v5 SSR in Next.js 15 App Router)
- Cấu hình Singleton QueryClient cho browser và Per-Request QueryClient cho server (`isServer` check).
- Server Component thực hiện `await queryClient.prefetchQuery(...)`.
- Bọc component client trong `<HydrationBoundary state={dehydrate(queryClient)}>`.
- Client component gọi `useQuery` với query key và queryFn tương đương, dữ liệu có sẵn ngay trong initial render mà không gây loading spinner hay layout shift.

### Guardrails & Antipatterns
- **Hydration Mismatch:** Không truy cập `localStorage`, `window`, hay random ID trong quá trình render Server Component.
- **Client-only libraries:** Lenis Smooth Scroll, Google OAuth Provider, Toast container phải được đặt trong client provider component có directive `'use client'`.
- **Dual API Client:** `api.js` cần đọc `process.env.NEXT_PUBLIC_API_URL` (client) và `process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL` (server), tránh tham chiếu `window` hoặc `localStorage` khi chạy trên Node.js runtime.

---

**Status:** Completed  
**Completed Date:** 2026-09-25  

---

## 3. Implementation Phases

| Phase | Phase ID | Primary Objective | Status |
|---|---|---|---|
| Phase 1 | `phase-01-setup-nextjs-foundation` | Cài đặt Next.js 15/16, di dời thư mục xung đột, cấu hình Root Layout & Client Providers | [x] Completed |
| Phase 2 | `phase-02-hydration-and-landing-page` | Triển khai SSR prefetch + TanStack Query Hydration cho Landing Page | [x] Completed |
| Phase 3 | `phase-03-plp-pdp-ssr-seo` | Triển khai SSR, Dynamic Metadata và Hydration cho PLP & PDP | [x] Completed |
| Phase 4 | `phase-04-client-routes-admin-checkout` | Chuyển đổi các routes Client (Auth, Profile, Cart, Checkout, Admin, Policies) | [x] Completed |
| Phase 5 | `phase-05-cleanup-verification` | Dọn dẹp Vite files, kiểm tra build, kiểm tra Hydration & Performance | [x] Completed |

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-25 13:30  
**Phase in progress:** None (All phases complete)  
**Status:** All 5 phases completed and verified on Next.js 16 (Turbopack)  

### Decisions made this session
- Next.js 16 App Router installed alongside existing React 19.2.6.
- In-memory Access Token + HttpOnly Refresh Token preserved 100% without modifying Backend `Gritmode_BE`.
- TanStack Query v5 SSR Hydration (`makeQueryClient`, `getQueryClient`, `HydrationBoundary`, `dehydrate`) applied to Landing Page (`/`), Product List (`/products`), and Product Detail (`/products/[id]`).
- All 24 client routes (Admin, Checkout, Profile, Policies, Orders, Payments, Login) successfully migrated to Next.js Client Components with router hooks and proper Suspense boundaries.
- Legacy Vite, React-Router-DOM, and entry files cleanly removed. Zero errors during production build.

### Next immediate action
Commit changes to branch `refactor/structure`.

---

## 4. Risks & Mitigations

1. **Rủi ro:** `src/app` hiện có các folder `store`, `layouts`, `routes` trùng tên với quy ước Next.js App Router.  
   **Khắc phục:** Thực hiện di dời và cập nhật import alias ngay ở Phase 1 trước khi khởi tạo route files.
2. **Rủi ro:** Module `lenis` và `@react-oauth/google` phụ thuộc DOM làm vỡ build SSR.  
   **Khắc phục:** Đóng gói trong `src/app/providers.jsx` đánh dấu `'use client'` và kiểm tra `typeof window !== 'undefined'`.
3. **Rủi ro:** Image component từ Cloudinary bị chặn nếu không cấu hình domain.  
   **Khắc phục:** Cấu hình `remotePatterns` trong `next.config.mjs` cho `res.cloudinary.com`.
4. **Rủi ro (Red-Team):** `useSearchParams` trong Client Component của Next.js 15 có thể de-opt toàn bộ trang thành Client Rendering lúc build nếu thiếu Suspense.  
   **Khắc phục:** Luôn đọc `searchParams` từ Props của Server Component Page hoặc bọc Client Component bằng `<Suspense>`.
5. **Rủi ro (Red-Team):** Import `react-router-dom` còn sót lại trong các component được gọi từ Server Component sẽ gây crash Node.js runtime.  
   **Khắc phục:** Thay thế dứt điểm bằng `next/link` và `next/navigation` theo từng phase.
