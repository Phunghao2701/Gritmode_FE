# Phase 05: Dọn dẹp Legacy Vite, Kiểm tra Build & Tối ưu Hiệu năng

**Phase ID:** `phase-05-cleanup-verification`  
**Stories Mapped:** NFR-01, NFR-03, NFR-04  
**Status:** passing

---

## 1. Mục tiêu
Gỡ bỏ hoàn toàn các file và thư viện thừa từ thời kỳ Vite/React-Router-DOM, thực hiện production build với Next.js 15/16, kiểm tra toàn bộ luồng người dùng để đảm bảo 0 regression và 0 hydration mismatch.

---

## 2. Nhiệm vụ cụ thể
- [x] **2.1 Dọn dẹp Legacy Files:**
  - Gỡ bỏ `index.html`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, `src/shared/routes/AppRoutes.jsx`.
  - Uninstall các package không còn dùng: `vite`, `@vitejs/plugin-react`, `react-router-dom`.
- [x] **2.2 Clean Build Verification:**
  - Chạy `npm run build` của Next.js (hoàn thành trong 1.48s, 24 routes, 0 errors).
  - Đảm bảo static generation và dynamic server routes được phân loại chính xác trong output build.
- [x] **2.3 Production Runtime Testing (`npm run start`):**
  - Chạy app ở chế độ production trên port local 3005.
  - Kiểm tra network requests: xác nhận SSR trả HTML có sẵn nội dung cho Landing Page, preload ảnh Cloudinary thành công.
  - Kiểm tra 0 lỗi Hydration mismatch.
- [x] **2.4 Performance & SEO Smoke Test:**
  - Xác nhận OpenGraph preview tags và semantic structure trong inspect head elements.

---

## 3. Files & Modules bị ảnh hưởng
- `package.json`
- `index.html` (Xóa)
- `vite.config.js` (Xóa)
- `src/main.jsx` (Xóa)
- `src/App.jsx` (Xóa)
- `src/app/routes/` (Xóa)

---

## 4. Dependencies
- Phụ thuộc: `phase-01-setup-nextjs-foundation`, `phase-02-hydration-and-landing-page`, `phase-03-plp-pdp-ssr-seo`, `phase-04-client-routes-admin-checkout`

---

## 5. Tiêu chí nghiệm thu (Tests & Acceptance)
- Lệnh `npm run build` vượt qua 100% không có lỗi.
- Lệnh `npm run start` phục vụ ứng dụng trơn tru.
- 0 reference sót lại liên quan đến `react-router-dom` hay `vite`.
- Tất cả các luồng chính (Xem hàng -> Thêm giỏ -> Checkout -> Đăng nhập -> Admin) hoạt động mượt mà.
