# Plan: Standalone Component & Design System Catalog HTML

**Date:** 2026-09-25
**Mode:** --fast
**Risk:** tiny — creates a single standalone HTML catalog file with zero runtime or schema risks
**Directory:** plans/component-catalog-html/
**Spec:** plans/component-catalog-html/spec.md

---

## Overview
Xây dựng một tệp HTML độc lập duy nhất `design-system-catalog.html` tại thư mục gốc của frontend (`d:\Gritmode\Gritmode_FE`), cho phép bất kỳ ai mở trực tiếp bằng trình duyệt để rà soát toàn bộ Design Tokens và các UI Component của hệ thống Gritmode mà không cần chạy server hoặc cài đặt thêm package.

---

## Phases

| Phase | Title | Priority | Status |
| ----- | ----- | -------- | ------ |
| [phase-01-catalog-shell-and-tokens](file:///d:/Gritmode/Gritmode_FE/plans/component-catalog-html/phase-01-catalog-shell-and-tokens.md) | Thiết lập Standalone HTML Shell, Theme Tokens & Điều hướng | P1 | completed |
| [phase-02-atomic-and-form-components](file:///d:/Gritmode/Gritmode_FE/plans/component-catalog-html/phase-02-atomic-and-form-components.md) | Xây dựng các Component Nguyên tử, Form & Feedback States | P1 | completed |
| [phase-03-feature-components-and-polish](file:///d:/Gritmode/Gritmode_FE/plans/component-catalog-html/phase-03-feature-components-and-polish.md) | Tích hợp Feature Components (ProductCard, Pagination) & Hoàn thiện Trải nghiệm | P1 | completed |

---

## Session Notes
<!-- Updated by cook automatically — do not edit manually -->

**Last active:** 2026-09-25 13:48
**Phase in progress:** all-phases-completed
**Status:** Hoàn thành toàn bộ 3 phases của kế hoạch

### Decisions made this session
- Tạo file độc lập `design-system-catalog.html` tại thư mục gốc, chạy trực tiếp trên bất kỳ trình duyệt nào mà không cần server hay build tool.
- Nhúng cấu hình Tailwind CSS Play CDN đồng bộ 100% với `tailwind.config.js` của Gritmode (`brand`, `street`, font `Plus Jakarta Sans`, font mono `JetBrains Mono`, `shadow-street`, keyframes).
- Tích hợp bộ chuyển đổi Dark / Light mode lưu trữ vào `localStorage`.
- Tích hợp thanh tìm kiếm thời gian thực (Live Search) hỗ trợ phím tắt `/`.
- Tích hợp nút Copy Code HTML/Tailwind một chạm có fallback `document.execCommand` cho giao thức `file:///`.
- Đầy đủ component: Design Tokens, PrimaryButton (tất cả variants, sizes, states), Badges/Tags, InputField (icon, password, error, disabled), LoadingSkeleton, EmptyState, ErrorState, PaginationControls, ProductCard streetwear và AppToast previews.

### Next immediate action
- Sẵn sàng bàn giao cho người dùng mở xem và kiểm tra.

---

## File Ownership
- `design-system-catalog.html` (chứa toàn bộ cấu trúc catalog, script điều khiển, token và component previews)

---

## Risks & Mitigations
- **Phụ thuộc CDN:** Trang nạp Tailwind CSS, Plus Jakarta Sans font và Lucide icons qua CDN.
  - *Giải pháp:* Sử dụng các CDN phổ biến có độ sẵn sàng cao (cdn.tailwindcss.com, unpkg/lucide, Google Fonts) với fallback inline font sans-serif.
- **Copy to Clipboard trên `file:///`:** Một số trình duyệt có thể hạn chế `navigator.clipboard` trên protocol `file://`.
  - *Giải pháp:* Cung cấp fallback sử dụng `document.execCommand('copy')` nếu `navigator.clipboard` không khả dụng.
