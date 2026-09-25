# Spec: Standalone Component & Design System Catalog HTML

**Date:** 2026-09-25
**Status:** Ready

---

## Problem Statement
Đội ngũ phát triển và thiết kế cần một giao diện trực quan, gọn nhẹ, chạy độc lập không phụ thuộc vào dev server hay runtime React (`file:///` chạy được ngay) để kiểm soát, đối chiếu và rà soát toàn bộ Design Tokens (màu sắc, typography, animation) cùng tất cả các UI Components của Gritmode nhằm đảm bảo tính nhất quán của theme và dễ dàng copy snippet code tái sử dụng.

---

## User Stories

<!-- P1 = MVP (must ship), P2 = nice-to-have, P3 = future/out-of-scope -->

- **[P1]** As a developer/reviewer, I want to open `design-system-catalog.html` directly in my web browser via file or URL so that I can instantly review all Gritmode design tokens and core UI components without running `npm run dev`.
  Accepted when: Opening the file in Chrome/Edge/Firefox renders all components with zero runtime errors or blank states.

- **[P1]** As a designer/developer, I want to view the complete Gritmode Design Tokens (Brand scale #f6f6f6-#171717, Street scale #fafafa-#09090b, typography fonts, letterSpacing, and shadow presets) so that I can verify theme consistency across the system.
  Accepted when: All token palettes are displayed with their visual swatch, CSS class name, and HEX color code.

- **[P1]** As a developer, I want to review all core UI components with their states & variants (Button, InputField, Search, Badges, LoadingSkeleton, EmptyState, ErrorState, Pagination, ProductCard) in both Light & Dark modes.
  Accepted when: Each component card displays its primary variants and can be switched dynamically between Light and Dark mode using the top toolbar.

- **[P1]** As a developer, I want a "Copy Code" button on each component block so that I can copy the exact HTML/Tailwind markup with one click.
  Accepted when: Clicking "Copy Code" copies the clean HTML/Tailwind snippet to clipboard and shows an instant visual notification ("Copied!").

- **[P2]** As a developer, I want a responsive sidebar navigation with category jumping and live search filtering so that I can find any component in under 2 seconds.
  Accepted when: Typing keywords in the search bar immediately filters out non-matching components, and clicking sidebar links smoothly scrolls to that component section.

- **[P3]** _(out of scope — noted for future)_
  Tự động quét AST từ các file React `.jsx` để tự sinh file HTML này qua build pipeline CI/CD.

---

## Functional Requirements

<!-- Number each. Be specific. -->

1. **FR-01 (File Location & Structure):** Tạo file `design-system-catalog.html` đặt tại thư mục gốc `d:\Gritmode\Gritmode_FE\design-system-catalog.html`, tích hợp đầy đủ HTML, CSS, và Vanilla JS trong một file duy nhất.
2. **FR-02 (Tailwind & Assets Setup):** Nhúng Tailwind CSS Play CDN với cấu hình mở rộng đúng chuẩn từ `tailwind.config.js` của Gritmode:
   - Bảng màu `brand` (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, DEFAULT: #000000, accent: #ffffff).
   - Bảng màu `street` (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950).
   - Font family: `Plus Jakarta Sans` và `JetBrains Mono`.
   - Shadow presets: `shadow-street`, `shadow-street-hover`, `glow-brand`.
   - Nạp bộ icon Lucide thông qua CDN script.
3. **FR-03 (Header Toolbar):**
   - Logo thương hiệu Gritmode & tiêu đề Catalog.
   - Nút bật/tắt Dark / Light Mode (áp dụng class `dark` vào thẻ `<html>`, lưu trạng thái vào `localStorage`).
   - Ô nhập tìm kiếm (Live Search / Filter) theo tên component hoặc từ khóa tag.
   - Badge hiển thị tổng số lượng components đang được quản lý.
4. **FR-04 (Sidebar Navigation):**
   - Danh mục phân tầng rõ ràng:
     - 01. Design Tokens (Colors, Typography, Elevation, Animations)
     - 02. Primitives & Actions (Buttons, Iconography, Badges & Tags)
     - 03. Form & Inputs (Input Fields, Search Bar, Selects)
     - 04. Feedback & Status (Empty State, Error State, Loading Skeletons, Toasts)
     - 05. Navigation & Lists (Pagination, Pagination Controls)
     - 06. Feature Components (Product Card showcase, Layout Containers)
   - Tự động highlight mục đang xem khi cuộn trang (Scrollspy).
5. **FR-05 (Component Card Presentation):**
   - Mỗi component được trình bày trong một Card tiêu chuẩn gồm:
     - Tên component và file nguồn tương ứng trong code React (ví dụ: `src/shared/components/Button/index.jsx`).
     - Bảng preview trực quan hiển thị các biến thể (variants) và trạng thái (default, hover, active, disabled, loading).
     - Nút "Copy Code" để sao chép nhanh markup HTML/Tailwind.
     - Nút "View Code" (collapsible) để xem mã nguồn trực tiếp ngay bên dưới.
6. **FR-06 (Copy Feedback):**
   - Hiển thị Toast thông báo ngắn gọn "Đã sao chép code vào clipboard!" khi người dùng bấm copy.

---

## Non-Functional Requirements

- **Zero Server Dependency:** Chạy hoàn toàn độc lập qua giao thức `file:///` hoặc bất kỳ web server tĩnh nào mà không cần cài đặt thêm package `npm`.
- **Performance:** Thời gian tải và hiển thị trang < 1 giây trên các trình duyệt hiện đại.
- **Responsiveness:** Giao diện co giãn tối ưu từ màn hình desktop lớn (1440px+), laptop (1024px) đến mobile (375px+).

---

## Success Criteria

- [ ] File `d:\Gritmode\Gritmode_FE\design-system-catalog.html` được khởi tạo thành công.
- [ ] Mở file trực tiếp trên trình duyệt hiển thị đầy đủ Design Tokens và các UI Components mà không có lỗi Javascript/CSS.
- [ ] Chuyển đổi Dark / Light mode hoạt động mượt mà, đổi màu toàn bộ các component preview.
- [ ] Tính năng tìm kiếm component lọc kết quả tức thì.
- [ ] Nút Copy Code sao chép chính xác snippet HTML/Tailwind và có thông báo trực quan.

---

## Out of Scope

- Không nhúng React compiler runtime (Babel standalone) để tránh làm nặng và chậm file.
- Không kết nối với backend API hay database thực tế (dữ liệu trên catalog là mock data chuẩn).

---

## Assumptions

- Trình duyệt của người dùng có kết nối internet để tải Tailwind CDN, Google Fonts và Lucide Icons trong lần mở đầu tiên (sau đó browser cache).
