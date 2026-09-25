# Brainstorm: Standalone Component & Design System Catalog HTML

**Date:** 2026-09-25

## Ideas Explored
1. **Next.js Internal Route (`/dev/components` or `/design-system`):** Render trực tiếp React components hiện có, tự động thừa hưởng mọi hook/provider, nhưng bắt buộc phải bật server phát triển (`npm run dev`).
2. **Standalone Living HTML Styleguide (`design-system-catalog.html` tại thư mục gốc):** Một file HTML độc lập chứa đầy đủ Design Tokens (brand/street colors, typography, shadows) và các mẫu component hoàn chỉnh, tích hợp sidebar tra cứu, toggle Dark/Light mode và nút Copy code snippet; mở được bằng bất kỳ trình duyệt nào mà không cần server hay node runtime.
3. **Script Export Snapshot tự động từ JSX sang HTML:** Cố gắng render các JSX components sang chuỗi HTML; nhược điểm là quá phức tạp vì các component phụ thuộc nhiều vào Redux, Next Router và các provider, rất dễ vỡ.
4. **Tích hợp Storybook/Ladle:** Đầy đủ tính năng nâng cao nhưng chi phí cài đặt và cấu hình bundle nặng, không cần thiết cho mục tiêu xem nhanh và kiểm soát UI.

## User's Direction
- Chọn **Phương án A: Standalone Living HTML Styleguide & Component Catalog**.
- Vị trí file: Tại thư mục gốc `d:\Gritmode\Gritmode_FE\design-system-catalog.html`.
- Mục tiêu chính: Bảng tổng hợp trực quan (catalog) để rà soát toàn bộ UI và theme/design tokens của hệ thống Gritmode.
- Tiện ích đi kèm:
  - Nút Copy nhanh mã HTML/Tailwind snippet của từng component để tái sử dụng ngay.
  - Bộ chuyển đổi giao diện Sáng / Tối (Dark / Light mode).
  - Thanh tìm kiếm và menu điều hướng nhanh (Quick filter / Sticky TOC).
  - Bao quát từ UI nguyên tử (Button, Input, Badge, Skeleton, Empty/Error) đến UI phân tử (ProductCard, Pagination, Toast preview).

## Open Questions
- Không còn câu hỏi bị chặn; cấu trúc và danh mục component đã rõ ràng.

## Risks
- **Trôi lệch cập nhật (Maintenance drift):** Nếu mã React JSX sau này đổi class hoặc cấu trúc, cần đồng bộ lại mẫu HTML trong catalog.
- **Phụ thuộc CDN khi offline:** File sử dụng Tailwind CDN + Google Fonts + Lucide Icons script nên cần kết nối mạng lần đầu để nạp assets (hoặc trình duyệt đã cache).
