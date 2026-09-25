# Phase 01: Thiết lập Nền tảng Next.js 15 & Cấu trúc Thư mục

**Phase ID:** `phase-01-setup-nextjs-foundation`  
**Stories Mapped:** FR-01, FR-02, FR-07, FR-08 (P1)  
**Status:** passing

---

## 1. Mục tiêu
Thiết lập thành công môi trường Next.js 15 App Router song hành với React 19 trong `Gritmode_FE`, giải quyết xung đột cấu trúc thư mục `src/app`, xây dựng Root Layout và cơ chế Client Providers (TanStack Query, Google OAuth, Lenis Smooth Scroll, Toast).

---

## 2. Nhiệm vụ cụ thể
- [x] **2.1 Dependencies:** Cài đặt `next@latest` (Next.js 16.3 / React 19), chuyển đổi scripts trong `package.json` (`dev`, `build`, `start`).
- [x] **2.2 Dời cấu trúc thư mục xung đột trong `src/app`:**
  - Chuyển `src/app/store/` -> `src/shared/store/`. Cập nhật tất cả các file đang import `authStore`, `cartStore`, `uiStore`.
  - Chuyển `src/app/layouts/` -> `src/shared/layouts/`.
  - Cập nhật alias trong `jsconfig.json` để hỗ trợ `@/...`.
- [x] **2.3 Cấu hình Next.js:** Tạo `next.config.mjs`:
  - Thiết lập `images.remotePatterns` cho Cloudinary (`res.cloudinary.com`).
  - Hỗ trợ React strict mode và biến môi trường `VITE_API_URL` & `VITE_GOOGLE_CLIENT_ID`.
- [x] **2.4 Query Client Factory:** Tạo tiện ích `src/shared/services/queryClient.js` theo chuẩn Next.js App Router (`isServer` và browser singleton instance, export `getQueryClient`).
- [x] **2.5 Root Layout & Providers:**
  - Tạo `src/app/providers.jsx` (`'use client'`) bọc `QueryClientProvider`, `GoogleOAuthProvider`, `SmoothScrollProvider`, `AppToast`, `AuthInit`.
  - Tạo `src/app/layout.jsx` import fonts và `src/index.css`, cấu hình thẻ metadata gốc, và render `Providers` bao quanh `children`.
- [x] **2.6 Dual API Configuration:** Tinh chỉnh `src/shared/services/api.js` để đọc `process.env.VITE_API_URL` và an toàn khi chạy trên server-side.

---

## 3. Files & Modules bị ảnh hưởng
- `package.json`
- `next.config.mjs` (Mới)
- `src/app/layout.jsx` (Mới)
- `src/app/providers.jsx` (Mới)
- `src/shared/services/queryClient.js`
- `src/shared/services/api.js`
- `src/shared/store/` (Di chuyển từ `src/app/store/`)
- `src/shared/layouts/` (Di chuyển từ `src/app/layouts/`)
- `jsconfig.json` (Mới hoặc cập nhật)

---

## 4. Dependencies
- Không phụ thuộc phase nào trước đó.

---

## 5. Tiêu chí nghiệm thu (Tests & Acceptance)
- Lệnh `npm run dev` khởi động thành công Next.js dev server.
- Truy cập `http://localhost:3000` tải được layout cơ bản với styles Tailwind, không bị crash runtime.
- Không có lỗi module resolution do việc di chuyển thư mục `store` và `layouts`.
