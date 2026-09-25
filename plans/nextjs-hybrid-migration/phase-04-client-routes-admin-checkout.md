# Phase 04: Chuyển đổi các Route Client (Admin, Checkout, Auth, Policies)

**Phase ID:** `phase-04-client-routes-admin-checkout`  
**Stories Mapped:** FR-06, NFR-03 (P3)  
**Status:** passing

---

## 1. Mục tiêu
Di dời toàn bộ các route còn lại sang cấu trúc Next.js App Router dưới dạng Client Components (`'use client'`). Tái sử dụng trọn vẹn logic của `ProtectedRoute` và `AdminRoute` mà không làm thay đổi luồng xác thực hoặc can thiệp vào `Gritmode_BE`.

---

## 2. Nhiệm vụ cụ thể
- [x] **2.1 Route Guards Migration:**
  - Chuyển `ProtectedRoute` và `AdminRoute` thành Client Component wrapper sử dụng `useAuthStore` và `useRouter` từ `next/navigation`.
  - Giữ nguyên cơ chế kiểm tra `isInitialized` và `user?.role`.
- [x] **2.2 Auth Routes:**
  - `src/app/login/page.jsx`: Tích hợp đăng nhập form và Google OAuth login.
  - Xử lý chuyển hướng sau khi đăng nhập thành công bằng `router.replace()`.
- [x] **2.3 Shop & Checkout Routes:**
  - `src/app/(public)/checkout/page.jsx`
  - `src/app/(public)/orders/[orderId]/success/page.jsx`
  - `src/app/(public)/orders/lookup/page.jsx`
  - `src/app/(public)/payment/result/page.jsx`
- [x] **2.4 Admin Dashboard Routes (`src/app/admin/*`):**
  - Tạo `src/app/admin/layout.jsx` bọc `AdminLayout` và `AdminRoute`.
  - Di chuyển các trang con: Dashboard, Products, Product Edit, Categories, Category Edit, Collections, Orders, Inventory, Users... dưới dạng Client Components.
- [x] **2.5 Profile & Static Policy Routes:**
  - `src/app/(public)/profile/page.jsx` (bọc trong `ProtectedRoute`)
  - `src/app/(public)/about/page.jsx`, `contact/page.jsx`, `policies/[slug]/page.jsx`, `size-guide/page.jsx`, `how-to-order/page.jsx`
- [x] **2.6 Navigation Replacement:**
  - Quét toàn bộ component thuộc các feature trên để thay thế `useNavigate`, `useLocation`, `useParams`, `<Link>` của `react-router-dom` sang các hooks tương ứng của `next/navigation` và `next/link`.

---

## 3. Files & Modules bị ảnh hưởng
- `src/app/(auth)/*`
- `src/app/(shop)/*`
- `src/app/admin/*`
- `src/app/profile/page.jsx`
- `src/app/policies/*`
- Các components trong `src/features/{auth, cart, checkout, admin, profile, policies}`

---

## 4. Dependencies
- Phụ thuộc: `phase-01-setup-nextjs-foundation`

---

## 5. Tiêu chí nghiệm thu (Tests & Acceptance)
- Đăng nhập thường và đăng nhập Google thành công, lưu token vào memory và redirect đúng trang đích.
- Truy cập `/admin` khi chưa đăng nhập bị chặn và redirect về `/login`.
- Đăng nhập tài khoản admin truy cập được đầy đủ các trang quản trị, thực hiện CRUD sản phẩm/danh mục bình thường.
- Luồng checkout và tra cứu đơn hàng khách vãng lai hoạt động chính xác.
