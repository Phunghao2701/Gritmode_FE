---
target: Admin order-detail modal
total_score: 24
p0_count: 0
p1_count: 3
timestamp: 2026-10-16T10-05-42Z
slug: src-features-admin-components-orderdetailmodal-jsx
---
# Review: Admin order-detail modal

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Trạng thái đơn và thanh toán rõ; loading/action failure chưa đủ rõ. |
| 2 | Match System / Real World | 3/4 | Ngôn ngữ vận hành phù hợp; `SKU`, `SL: X2`, `PAYOS` hơi kỹ thuật. |
| 3 | User Control and Freedom | 2/4 | Có đóng bằng X/backdrop, nhưng thiếu Escape, focus return và focus trap. |
| 4 | Consistency and Standards | 2/4 | Shell monochrome nhưng action dùng nhiều màu và nhiều kiểu pill. |
| 5 | Error Prevention | 2/4 | Hủy đơn có nhập lý do nhưng chưa bắt buộc; workflow thiếu cue hậu quả. |
| 6 | Recognition Rather Than Recall | 3/4 | Thông tin được gom đúng; chưa có copy nhanh mã đơn/địa chỉ/SKU. |
| 7 | Flexibility and Efficiency | 2/4 | Có action trực tiếp nhưng thiếu shortcut và đường tắt cho admin. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Sạch và dễ quét; nested panel, pill, micro-label hơi đồng dạng. |
| 9 | Error Recovery | 2/4 | Có loading/empty state; thiếu lỗi fetch, retry và feedback mutation rõ ràng. |
| 10 | Help and Documentation | 1/4 | Chưa giải thích payment state, lifecycle action hoặc thuật ngữ. |
| **Total** |  | **24/40** | **Acceptable — nên polish đáng kể trước khi chốt.** |

## Anti-Patterns Verdict

**LLM assessment:** Rủi ro AI-slop ở mức trung bình. Modal có nội dung nghiệp vụ thật và scan path hợp lý, nhưng cấu trúc `rounded-[28px]` + blur backdrop + nested neutral panels + pill badges + `shadow-2xl` khá giống admin template phổ biến.

**Deterministic scan:** Detector FK trả về `[]` cho `OrderDetailModal.jsx` và route `/admin/orders`: 0 findings, không có rule/location cần xử lý. Không có browser khả dụng trong phiên này (`Browser is not available: iab`), nên không có overlay live; HTTP probe route trả `200 OK`.

## Overall Impression

Đây là modal vận hành tốt về mặt thông tin: trạng thái → người nhận → sản phẩm → tiền → action. Điểm yếu lớn nhất không phải thiếu nội dung mà là mọi thứ đang có cùng “độ nhỏ và độ mềm”, khiến admin phải đọc kỹ khi kiểm tra đơn. Cơ hội lớn nhất là biến nó thành một “order record” rõ ràng, ít chrome hơn và có một action kế tiếp nổi bật.

## What's Working

- Tách riêng **trạng thái đơn hàng** và **thanh toán**, giúp tránh hiểu nhầm.
- Trình tự thông tin hợp lý cho admin: identity → status → recipient/address → products → pricing → actions.
- Nền trắng, divider nhẹ, chữ đen và nút đóng đen giữ được ngôn ngữ Gritmode.

## Priority Issues

### [P1] Modal chưa an toàn đầy đủ cho keyboard/screen reader

**Why it matters:** Nút X chỉ có icon và chưa có accessible name; source chưa thể hiện Escape handling, focus trap, focus return hoặc focus-visible rõ ràng. Các label 10px màu nhạt cũng dễ hụt contrast.

**Fix:** Thêm `aria-label`, target tối thiểu 44px, focus ring, Escape dismissal, focus return về nút mở modal và không dùng màu làm tín hiệu duy nhất.

**Suggested command:** `$fk check`

### [P1] Action footer lệch khỏi style monochrome

**Why it matters:** Các action workflow dùng blue, indigo, purple, emerald cùng lúc; chúng cạnh tranh với nút ĐÓNG và làm modal giống dashboard template hơn hệ thống Gritmode.

**Fix:** Chỉ giữ một primary action kế tiếp; action phụ dùng neutral; chỉ dùng rose cho hủy/destructive. Màu là cue phụ, label và vị trí mới là cue chính.

**Suggested command:** `$fk calm` hoặc `$fk color`

### [P1] Typography quá nhỏ và quá đồng đều

**Why it matters:** `text-[10px]`, `text-[11px]`, uppercase labels và metadata dày khiến việc đối soát tiền, size/variant, địa chỉ tốn công. Tên sản phẩm còn có nguy cơ bị truncate.

**Fix:** Tăng nhẹ label/metadata quan trọng, tăng authority cho mã đơn và tổng tiền, cho tên sản phẩm wrap, đổi các label không cần thiết từ uppercase sang sentence case.

**Suggested command:** `$fk type`

### [P2] Quá nhiều “soft dashboard chrome”

**Why it matters:** Outer radius 28px, nhiều inner panel radius 16px, pill, blur và shadow làm record nghiệp vụ bị trang trí quá mức.

**Fix:** Giữ một container chính, giảm nested surface, dùng radius khoảng 16–20px, divider hairline và hierarchy bằng typography.

**Suggested command:** `$fk trim` hoặc `$fk space`

### [P2] Loading/error/mutation state chưa hoàn chỉnh

**Why it matters:** Có loading và empty state nhưng chưa có fetch error/retry; mutation chủ yếu chỉ disabled button. Đóng modal sau action có thể làm mất context xác nhận.

**Fix:** Thêm error + retry inline, feedback pending rõ ràng, và sau khi action thành công nên giữ modal để cập nhật status hoặc hiển thị xác nhận audit.

**Suggested command:** `$fk prod`

## Persona Red Flags

- **Alex — power user:** Không có Escape/copy nhanh mã đơn, SKU, địa chỉ; footer nhiều action khiến thao tác lặp chậm.
- **Sam — accessibility user:** Nút đóng icon-only, thiếu focus management rõ ràng, microtype nhạt và status có nguy cơ phụ thuộc vào màu.
- **Riley — stress tester:** Tên sản phẩm dài bị truncate; địa chỉ/note dài có thể phá layout; detail fetch chưa có retry; footer có thể chật ở viewport hẹp.

## Minor Observations

- `CHI TIẾT ĐƠN HÀNG ADMIN` hơi dư vì context admin đã rõ.
- Timestamp modal có giây, trong khi bảng dùng format ngắn hơn.
- Bảng dùng `VIETQR`, modal có thể hiện raw `PAYOS`; nên thống nhất label hiển thị.
- `SL: X2` nên đổi thành `SL: 2` hoặc `×2`.
- Với thời trang, thumbnail nhỏ hoặc variant/size nổi bật hơn sẽ giúp đối soát nhanh.
- Sale label, discount emerald, amber note và nhiều action color đang làm loãng monochrome.

## Questions to Consider

1. Modal này ưu tiên **kiểm tra đơn** hay **đẩy trạng thái đơn**? Một mục nên được làm primary rõ hơn.
2. Admin có cần thumbnail và size/variant nổi bật để xác nhận đúng sản phẩm không?
3. Sau khi action thành công, modal nên đóng ngay hay giữ lại như một điểm xác nhận/audit?
