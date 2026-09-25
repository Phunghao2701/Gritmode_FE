# Phase 02 — Xây dựng các Component Nguyên tử, Form & Feedback States

## Objective
Hiện thực hóa các component tầng Atomic (Buttons, Badges, Icons), Form Controls (InputField, Search Input, Select) và Feedback States (Loading Skeleton, Empty State, Error State) trong file `design-system-catalog.html`. Đồng thời tích hợp cơ chế Copy Code snippet một chạm kèm thông báo visual toast.

## Tasks
1. Xây dựng tiện ích Copy Code & Toast Feedback:
   - Script lắng nghe sự kiện click trên các nút "Copy Code".
   - Sao chép HTML snippet vào clipboard (hỗ trợ cả `navigator.clipboard` và fallback `document.execCommand`).
   - Hiển thị Toast thông báo nổi "Đã sao chép code vào clipboard!" trong 2 giây rồi tự ẩn.
2. Xây dựng Section: 02. Primitives & Actions:
   - **Buttons:**
     - Các biến thể: Primary (nền đen chữ trắng / dark mode nền trắng chữ đen), Secondary/Outline, Ghost/Text, Danger.
     - Các kích thước: Small (`px-3 py-1.5 text-xs`), Medium (`px-4 py-2 text-sm`), Large (`px-6 py-3 text-base`).
     - Các trạng thái: Normal, Hover, Active, Disabled, Loading (Spinner SVG tích hợp).
   - **Badges & Status Tags:**
     - Các nhãn: `Mới`, `Giảm giá -30%`, `Hot`, `Hết hàng`, `Chờ xử lý`, `Đang giao`, `Đã nhận`.
3. Xây dựng Section: 03. Form & Inputs:
   - **InputField:**
     - Default input kèm floating/standard label.
     - Input với biểu tượng bên trái/phải (Search icon, Eye toggle password).
     - Trạng thái Lỗi (viền đỏ, icon cảnh báo, thông báo validation bên dưới).
     - Trạng thái Disabled (mờ, không thể focus).
4. Xây dựng Section: 04. Feedback & Status:
   - **Loading Skeleton:**
     - Mẫu skeleton văn bản (nhiều dòng ngẫu nhiên với hiệu ứng pulse).
     - Mẫu skeleton thẻ sản phẩm (khung hình ảnh + 2 dòng chữ).
   - **Empty State:**
     - Biểu tượng giỏ hàng trống hoặc hộp rỗng, tiêu đề thông báo và nút kêu gọi hành động (Call to action).
   - **Error State:**
     - Biểu tượng lỗi mạng/server, tiêu đề giải thích và nút "Thử lại" (Retry).

## Files / Modules Affected
- `design-system-catalog.html`

## Dependencies
- Phụ thuộc vào Phase 01 (Layout shell và Tailwind CDN đã được cấu hình).

## Tests & Acceptance Criteria
- [ ] Bấm nút "Copy Code" tại bất kỳ thẻ component nào, nội dung snippet HTML/Tailwind được copy chính xác vào clipboard.
- [ ] Toast thông báo visual "Đã sao chép!" xuất hiện mượt mà và biến mất sau 2s.
- [ ] Tất cả các biến thể Button, Input và Feedback states hiển thị chuẩn chỉnh cả ở chế độ Light và Dark.

## Risks & Notes
- Đoạn mã mẫu copy cần được format thụt lề sạch đẹp (clean indentation) để người dùng có thể paste trực tiếp vào code của họ.
