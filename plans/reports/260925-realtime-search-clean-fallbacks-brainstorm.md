# Brainstorm: Realtime Search Modal & Loại bỏ toàn bộ Fallback / Mock Data

**Date:** 2026-09-25

## Ideas Explored

1. **Option 1: Realtime Search Modal với Quick Preview Dropdown**
   - Người dùng mở modal tìm kiếm ở Header, gõ từ khóa (debounce 300ms).
   - Tự động gọi API `getProductsApi({ search: query, limit: 6 })` và hiển thị trực tiếp danh sách kết quả (hình ảnh, tên, giá, phân loại).
   - Có nút "Xem tất cả X kết quả" dẫn sang `/products?search=...`.
   - Gợi ý nhanh: Lấy trực tiếp từ danh sách danh mục thực trong Database (`categories` qua API) thay vì mảng chuỗi cứng.

2. **Option 2: Dedicated Search Autocomplete API ở Backend**
   - Viết thêm route `/api/v1/products/search-suggest?q=...` chỉ trả về `id, name, thumbnail, price, slug` tối ưu payload cực nhẹ.
   - Ưu điểm: Tối ưu băng thông và tốc độ phản hồi.
   - Nhược điểm: Phải sửa cả BE và FE, trong khi API `getProducts` hiện tại đã hỗ trợ `search`, `limit`, và cache Redis cực nhanh.

3. **Lựa chọn thống nhất:** Sử dụng Option 1 (tận dụng hook `useProducts` / `getProductsApi` sẵn có với Redis caching), kết hợp tinh chỉnh UI Search Modal của `MainLayout.jsx`.

## Làm sạch các Fallback / Mock Data

1. **Gợi ý tĩnh trong Search Modal:** Xóa mảng hardcoded `['T-shirts & Polo', 'Sweatshirts & Hoodies', 'Caps & Hats'...]`, thay bằng các Category thực tế được fetch từ DB.
2. **Hero Slides Fallback trong `LandingPage.jsx`:** Xóa object fallback Unsplash `id: 'fallback'`, chỉ hiển thị slides khi có sản phẩm thực từ DB.
3. **Cart Fallback Image trong `cartStore.js`:** Loại bỏ link Unsplash cố định, xử lý placeholder trung tính nếu sản phẩm thiếu ảnh.

## Open Questions

- Giới hạn kết quả xem nhanh trong modal là bao nhiêu? (Đề xuất: 5-6 sản phẩm để không làm tràn màn hình modal).
- Độ trễ debounce tìm kiếm: 300ms là tiêu chuẩn tốt nhất cho trải nghiệm gõ phím mượt mà không spam server.

## Risks

- Nếu người dùng gõ từ khóa rất nhanh và mạng chập chờn: Cần quản lý race condition bằng React Query (tự động cancel query cũ khi key query thay đổi).
- Trải nghiệm bàn phím trên mobile: Cần đảm bảo modal đóng mở êm mượt, focus input tự động khi mở và hỗ trợ nút Clear chữ nhanh.
