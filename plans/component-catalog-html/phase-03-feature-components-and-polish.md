# Phase 03 — Tích hợp Feature Components (ProductCard, Pagination) & Hoàn thiện Trải nghiệm

## Objective
Hiện thực hóa các component cấp Organism phức hợp hơn như ProductCard chuẩn streetwear Gritmode, bộ điều khiển Pagination & PaginationControls, và mẫu thông báo Toast. Đồng thời hoàn thiện bộ lọc tìm kiếm Live Search, tối ưu trải nghiệm responsive và chạy kiểm thử smoke test.

## Tasks
1. Xây dựng Section: 05. Navigation & Lists:
   - **Pagination & PaginationControls:**
     - Các nút điều hướng Trang trước / Trang sau với icon mũi tên.
     - Số trang hiện tại đang active (`bg-black text-white` hoặc ngược lại trong dark mode).
     - Dấu chấm lửng `...` hiển thị các trang ngắt quãng.
2. Xây dựng Section: 06. Feature Showcase Components:
   - **ProductCard:**
     - Tái hiện đúng tỉ lệ khung hình sản phẩm Gritmode, badge giảm giá, tiêu đề sản phẩm, khoảng giá (`formatProductPriceRange`), trạng thái hết hàng hoặc hover chuyển ảnh/hiện nút thêm giỏ hàng.
   - **Toast Notifications Preview:**
     - Mẫu Toast Thành công (xanh lá), Lỗi (đỏ), Thông tin (đen/xám) nổi góc màn hình.
3. Hoàn thiện tính năng Live Search & Filter:
   - Gắn sự kiện `input` vào thanh tìm kiếm ở Header.
   - Tự động ẩn/hiện các Card component dựa trên tên hoặc thẻ tags khi người dùng gõ từ khóa.
   - Hiển thị thông báo "Không tìm thấy component phù hợp" nếu từ khóa không khớp.
4. Tối ưu giao diện & Responsive:
   - Hỗ trợ menu trượt hoặc collapse trên màn hình nhỏ.
   - Thêm nút cuộn nhanh lên đầu trang (Back to top).
5. Kiểm thử tổng thể (Smoke Test):
   - Mở trực tiếp file `design-system-catalog.html` bằng trình duyệt.
   - Kiểm tra tương tác: Dark Mode toggle, Live Search, Copy Snippet, Responsive viewport.

## Files / Modules Affected
- `design-system-catalog.html`

## Dependencies
- Phụ thuộc vào Phase 01 và Phase 02.

## Tests & Acceptance Criteria
- [ ] Gõ từ khóa tìm kiếm (ví dụ: "Product", "Button") trong ô search lập tức lọc chính xác các thẻ component tương ứng.
- [ ] ProductCard hiển thị đẹp mắt, chuẩn phong cách streetwear tối giản của Gritmode.
- [ ] Màn hình mobile thu nhỏ hiển thị mượt mà không bị vỡ layout hay tràn ngang.

## Risks & Notes
- Đảm bảo các ảnh minh họa trong ProductCard sử dụng ảnh placeholder/mockup chất lượng cao từ CDN Unsplash an toàn hoặc SVG để không bị lỗi 404 khi mở file offline.
