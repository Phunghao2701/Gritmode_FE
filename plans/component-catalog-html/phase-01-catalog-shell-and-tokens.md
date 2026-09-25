# Phase 01 — Thiết lập Standalone HTML Shell, Theme Tokens & Điều hướng

## Objective
Khởi tạo file `design-system-catalog.html` với cấu hình Tailwind CSS Play CDN tương thích 100% với `tailwind.config.js` của Gritmode, nạp font Plus Jakarta Sans, Lucide Icons, dựng bố cục layout (Header + Sidebar TOC + Main Content), bộ chuyển đổi Dark/Light mode và bảng hiển thị toàn bộ Design Tokens (Color scales, Typography, Shadows).

## Tasks
1. Tạo file `design-system-catalog.html` tại thư mục gốc của frontend `d:\Gritmode\Gritmode_FE`.
2. Cấu hình thẻ `<head>`:
   - Thư viện Tailwind Play CDN `<script src="https://cdn.tailwindcss.com"></script>`.
   - Cấu hình `tailwind.config` đồng bộ với cấu hình dự án:
     - `brand` scale: 50..950, DEFAULT (#000000), accent (#ffffff).
     - `street` scale: 50..950.
     - `fontFamily`: `sans` / `display`: ['Plus Jakarta Sans', 'sans-serif'], `mono`: ['JetBrains Mono', 'monospace'].
     - `boxShadow`: `shadow-street`, `shadow-street-hover`, `glow-brand`.
     - `darkMode: 'class'`.
   - Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`) và Lucide Icons CDN script (`unpkg.com/lucide@latest`).
3. Xây dựng Header Toolbar:
   - Logo thương hiệu Gritmode & Badge phiên bản/tổng số component.
   - Thanh tìm kiếm Live Search (input filter).
   - Nút Toggle Dark / Light mode (lưu vào `localStorage`, toggle class `dark` trên thẻ `<html>`).
4. Xây dựng Sticky Sidebar Navigation:
   - Danh sách các danh mục: Design Tokens, Primitives, Form Inputs, Feedback States, Feature Components.
   - Smooth scroll đến từng section khi click.
5. Xây dựng Section: 01. Design Tokens:
   - Bảng màu `brand` (50 -> 950, default, accent) hiển thị swatch, tên class và mã hex.
   - Bảng màu `street` (50 -> 950) hiển thị swatch, tên class và mã hex.
   - Bảng mẫu Typography & Font Weights (`Plus Jakarta Sans`, kích cỡ từ xs đến 4xl).
   - Mẫu Shadow & Elevation (`shadow-street`, `shadow-street-hover`, `glow-brand`).

## Files / Modules Affected
- `design-system-catalog.html` (mới tạo)

## Dependencies
- Không phụ thuộc các phase khác.

## Tests & Acceptance Criteria
- [ ] Mở file `design-system-catalog.html` trực tiếp trong trình duyệt không báo lỗi JavaScript hoặc CSS nào.
- [ ] Bấm nút Dark Mode chuyển toàn bộ theme sang nền tối (`bg-street-950` / `bg-street-900`) và ngược lại.
- [ ] Các swatch màu hiển thị trực quan và đúng mã HEX định nghĩa trong `tailwind.config.js`.

## Risks & Notes
- Đảm bảo script cấu hình `tailwind.config` được gán trước khi Tailwind CDN khởi chạy.
