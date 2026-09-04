/**
 * Centralized Customer Policies and Support Data
 * Source of truth for Gritmode® Customer Policies
 */

export const POLICIES_DATA = {
  return: {
    slug: 'return',
    title: 'Chính sách Đổi trả & Hoàn tiền',
    subtitle: 'Cam kết hỗ trợ đổi trả linh hoạt, minh bạch và đảm bảo quyền lợi tối đa cho khách hàng của Gritmode.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'scope', title: '1. Phạm vi & Thời hạn áp dụng' },
      { id: 'conditions', title: '2. Điều kiện sản phẩm hợp lệ' },
      { id: 'non-returnable', title: '3. Các trường hợp không áp dụng đổi trả' },
      { id: 'process', title: '4. Quy trình thực hiện đổi trả' },
      { id: 'shipping-fee', title: '5. Phí vận chuyển khi đổi hàng' },
      { id: 'refund', title: '6. Chính sách hoàn tiền' },
      { id: 'contact', title: '7. Kênh tiếp nhận hỗ trợ' },
    ],
    sections: [
      {
        id: 'scope',
        title: '1. Phạm vi & Thời hạn áp dụng',
        content: `
- **Thời hạn đổi hàng:** Trong vòng **7 ngày** tính từ ngày khách hàng nhận được kiện hàng từ đơn vị vận chuyển.
- **Phạm vi áp dụng:** Áp dụng cho toàn bộ đơn hàng mua sắm trực tuyến qua website chính thức và hệ thống Store của Gritmode trên toàn quốc.
- Mỗi đơn hàng được hỗ trợ đổi size hoặc đổi mẫu **01 lần**.
        `,
      },
      {
        id: 'conditions',
        title: '2. Điều kiện sản phẩm hợp lệ',
        content: `
Sản phẩm yêu cầu đổi trả cần đáp ứng đầy đủ các tiêu chuẩn sau:
- Sản phẩm còn **nguyên tem mác (hangtag), hóa đơn hoặc mã đơn hàng** và bao bì đóng gói nguyên vẹn của Gritmode.
- Sản phẩm **chưa qua sử dụng, chưa giặt ủi, không bị ám mùi cơ thể / nước hoa / hóa chất**.
- Không có dấu hiệu hư hại do ngoại lực sau khi nhận hàng (rách vải, xước hình in, vết ố bẩn).
- Trường hợp sản phẩm có lỗi từ nhà sản xuất (rách vải trước khi mặc, lỗi đường chỉ, in lỗi, giao sai mẫu/size), Gritmode tiến hành đổi mới 100%.
        `,
      },
      {
        id: 'non-returnable',
        title: '3. Các trường hợp không áp dụng đổi trả',
        content: `
- Sản phẩm thuộc các chương trình xả kho giảm giá sâu (Flash Sale / Clearance > 50%) có thông báo *"Không áp dụng đổi trả"*.
- Sản phẩm đã bị cắt tem mác hoặc đã qua giặt sấy, sử dụng.
- Quá thời hạn **7 ngày** kể từ khi nhận hàng.
- Sản phẩm bị hư hại do khách hàng bảo quản hoặc sử dụng sai hướng dẫn (giặt với chất tẩy mạnh, phơi trực tiếp dưới nắng gắt làm co rút vải).
        `,
      },
      {
        id: 'process',
        title: '4. Quy trình thực hiện đổi trả',
        content: `
1. **Bước 1 — Liên hệ:** Khách hàng nhắn tin trực tiếp qua Hotline/Zalo **0901 234 567** hoặc gửi email đến **support@gritmode.com** kèm Mã đơn hàng và hình ảnh sản phẩm cần đổi.
2. **Bước 2 — Xác nhận:** Đội ngũ CSKH sẽ kiểm tra thông tin và tạo phiếu gửi đổi hàng trong vòng 2-4 giờ làm việc.
3. **Bước 3 — Đổi hàng tận nơi:** Bưu tá sẽ mang sản phẩm mới đến tận nhà giao cho bạn, đồng thời nhận lại sản phẩm cần đổi (khách hàng không cần tự ra bưu cục).
        `,
      },
      {
        id: 'shipping-fee',
        title: '5. Phí vận chuyển khi đổi hàng',
        content: `
- **Lỗi do Gritmode (giao sai mẫu, sai size, sản phẩm lỗi sản xuất):** Gritmode chi trả **100%** phí vận chuyển 2 chiều.
- **Nhu cầu cá nhân (khách hàng muốn đổi size khác hoặc đổi mẫu theo sở thích):** Khách hàng hỗ trợ phí vận chuyển 2 chiều theo biểu phí vận chuyển tiêu chuẩn.
        `,
      },
      {
        id: 'refund',
        title: '6. Chính sách hoàn tiền',
        content: `
- Gritmode ưu tiên hỗ trợ đổi sang sản phẩm cùng loại hoặc sản phẩm có giá trị tương đương/cao hơn.
- Trường hợp sản phẩm cần đổi hết hàng toàn hệ thống và khách hàng không chọn được mẫu thay thế ưng ý, Gritmode sẽ tiến hành hoàn tiền qua số tài khoản ngân hàng của bạn trong vòng **3 - 5 ngày làm việc**.
        `,
      },
      {
        id: 'contact',
        title: '7. Kênh tiếp nhận hỗ trợ',
        content: `
- **Hotline CSKH:** 0926109229 hoặc 0822600053 (09:30 – 22:00 hàng ngày)
- **Email:** support@gritmode.com
- **Kênh:** Online Store (Based in HCM City)
        `,
      },
    ],
  },

  shipping: {
    slug: 'shipping',
    title: 'Chính sách Vận chuyển & Giao nhận',
    subtitle: 'Giao hàng hỏa tốc và miễn phí vận chuyển toàn quốc cho mọi đơn hàng thời trang tại Gritmode.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'coverage', title: '1. Khu vực giao hàng' },
      { id: 'freeship', title: '2. Chính sách Miễn phí vận chuyển (Freeship)' },
      { id: 'timeline', title: '3. Thời gian xử lý & Giao hàng dự kiến' },
      { id: 'inspection', title: '4. Chính sách Đồng kiểm khi nhận hàng' },
      { id: 'tracking', title: '5. Tra cứu & Theo dõi đơn hàng' },
      { id: 'failed-delivery', title: '6. Xử lý khi giao hàng không thành công' },
    ],
    sections: [
      {
        id: 'coverage',
        title: '1. Khu vực giao hàng',
        content: `
Gritmode cung cấp dịch vụ giao hàng tận nơi đến **tất cả 63 tỉnh thành trên toàn lãnh thổ Việt Nam**, bao gồm cả các khu vực huyện xã, hải đảo thông qua các đối tác vận chuyển uy tín (Giao Hàng Nhanh, Viettel Post, SPX Express).
        `,
      },
      {
        id: 'freeship',
        title: '2. Chính sách Miễn phí vận chuyển (Freeship)',
        content: `
- **Miễn phí vận chuyển toàn quốc (Freeship 0đ)** áp dụng cho tất cả các đơn hàng mua sắm trực tiếp trên website Gritmode, không giới hạn giá trị tối thiểu hay khoảng cách địa lý.
- Mọi chi phí giao hàng tiêu chuẩn đều được Gritmode tài trợ 100%.
        `,
      },
      {
        id: 'timeline',
        title: '3. Thời gian xử lý & Giao hàng dự kiến',
        content: `
- **Thời gian xử lý đóng gói:** Đơn hàng được xử lý và bàn giao cho đơn vị vận chuyển trong vòng 24 giờ làm việc sau khi đặt hàng (hoặc sau khi thanh toán VietQR thành công).
- **Khu vực TPHCM & Các tỉnh/thành phố miền Nam:** 1-3 ngày làm việc
- **Khu vực miền Trung & miền Bắc:** 3-5 ngày làm việc
- **Lưu ý:** Thời gian giao hàng có thể kéo dài thêm 1-2 ngày trong các dịp Lễ Tết, thiên tai hoặc đợt Siêu Sale lớn
        `,
      },
      {
        id: 'inspection',
        title: '4. Chính sách Đồng kiểm khi nhận hàng',
        content: `
- Khách hàng được quyền **mở kiện hàng kiểm tra ngoại quan sản phẩm** (đúng mẫu mã, đúng màu sắc, đúng size số) trước khi ký nhận hoặc thanh toán tiền mặt (COD) cho nhân viên giao hàng.
- Không thử đồ hoặc làm bẩn sản phẩm trong quá trình đồng kiểm.
        `,
      },
      {
        id: 'tracking',
        title: '5. Tra cứu & Theo dõi đơn hàng',
        content: `
- Khách hàng có thể dễ dàng kiểm tra trạng thái đơn hàng bất kỳ lúc nào tại trang **[Tra cứu đơn hàng](/orders/lookup)** bằng cách nhập Mã đơn hàng và Email/Số điện thoại đặt hàng.
- Khách hàng đã đăng nhập có thể theo dõi tiến trình trực tiếp tại mục **[Hồ sơ > Đơn mua của tôi](/profile)**.
        `,
      },
      {
        id: 'failed-delivery',
        title: '6. Xử lý khi giao hàng không thành công',
        content: `
- Bưu tá sẽ liên hệ giao hàng tối đa **03 lần**. Trường hợp không liên lạc được, kiện hàng sẽ được lưu tại bưu cục địa phương trong 24-48 giờ trước khi chuyển hoàn về Gritmode.
- Đội ngũ CSKH sẽ liên hệ lại qua điện thoại/email để xác nhận lại thời gian giao thuận tiện nhất cho bạn.
        `,
      },
    ],
  },

  warranty: {
    slug: 'warranty',
    title: 'Chính sách Bảo hành Sản phẩm',
    subtitle: 'Cam kết chất lượng đường may, phụ liệu và hỗ trợ kỹ thuật may mặc cho trang phục streetwear Gritmode.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'scope', title: '1. Thời hạn & Phạm vi bảo hành' },
      { id: 'coverage', title: '2. Các trường hợp được bảo hành' },
      { id: 'exceptions', title: '3. Các trường hợp từ chối bảo hành' },
      { id: 'process', title: '4. Quy trình tiếp nhận & Sửa chữa' },
    ],
    sections: [
      {
        id: 'scope',
        title: '1. Thời hạn & Phạm vi bảo hành',
        content: `
- **Thời hạn bảo hành:** **30 ngày** kể từ ngày khách hàng nhận sản phẩm.
- Áp dụng cho tất cả các sản phẩm chính hãng mang thương hiệu **Gritmode®** bao gồm Áo thun, Hoodie, Long Sleeve, Quần.
        `,
      },
      {
        id: 'coverage',
        title: '2. Các trường hợp được bảo hành',
        content: `
Gritmode hỗ trợ sửa chữa hoặc thay thế linh kiện miễn phí đối với các lỗi kỹ thuật may:
- **Đường may & Chỉ chần:** Đứt chỉ nách áo, bung chỉ gấu áo, lỗi may nối thân áo do quá trình sản xuất.
- **Phụ liệu:** Lỗi khóa kéo (zipper), nút bấm kim loại, dây rút quần/áo hoodie bị tụt hoặc hỏng hóc kỹ thuật.
- **Hình in & Thêu:** Bong tróc keo in, nứt vỡ hình in bất thường trong 30 ngày đầu dù đã giặt đúng hướng dẫn.
        `,
      },
      {
        id: 'exceptions',
        title: '3. Các trường hợp từ chối bảo hành',
        content: `
- Sản phẩm bị rách, thủng, co rút hoặc biến dạng do va quẹt vật sắc nhọn, cháy nổ, thú cưng cắn.
- Sản phẩm bị phai màu hoặc ố vàng do giặt chung với quần áo màu khác, sử dụng thuốc tẩy có nồng độ Clo cao.
- Sản phẩm đã bị can thiệp sửa chữa, cắt ngắn bởi các đơn vị may mặc bên ngoài.
        `,
      },
      {
        id: 'process',
        title: '4. Quy trình tiếp nhận & Sửa chữa',
        content: `
1. Gửi hình ảnh chi tiết vị trí cần bảo hành qua Hotline CSKH **0926 109 229** hoặc email **support.gritmode@gmail.com**.
2. Sau khi xác nhận đủ điều kiện, Gritmode tiếp nhận sản phẩm và tiến hành xử lý kỹ thuật trong vòng **3 - 7 ngày làm việc**.
        `,
      },
    ],
  },

  payment: {
    slug: 'payment',
    title: 'Quy định & Hình thức Thanh toán',
    subtitle: 'Hướng dẫn chi tiết các phương thức thanh toán an toàn, minh bạch và tự động được hỗ trợ tại Gritmode.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'methods', title: '1. Các phương thức thanh toán được hỗ trợ' },
      { id: 'cod', title: '2. Thanh toán tiền mặt khi nhận hàng (COD)' },
      { id: 'payos', title: '3. Chuyển khoản VietQR tức thì (payOS / NAPAS247)' },
      { id: 'security', title: '4. Bảo mật giao dịch & Xác nhận tự động' },
      { id: 'troubleshooting', title: '5. Xử lý sự cố giao dịch & Chuyển nhầm' },
    ],
    sections: [
      {
        id: 'methods',
        title: '1. Các phương thức thanh toán được hỗ trợ',
        content: `
Gritmode hỗ trợ 02 phương thức thanh toán chính thức tại cổng thanh toán:
1. **Thanh toán tiền mặt khi nhận hàng (COD - Cash on Delivery)**.
2. **Chuyển khoản VietQR tự động qua cổng thanh toán payOS (Chuẩn NAPAS247)**.
*(Lưu ý: Hệ thống hiện tại không yêu cầu nhập thông tin thẻ quốc tế trực tiếp nhằm bảo vệ tuyệt đối dữ liệu tài chính của khách hàng).*
        `,
      },
      {
        id: 'cod',
        title: '2. Thanh toán tiền mặt khi nhận hàng (COD)',
        content: `
- Khách hàng thanh toán trực tiếp đúng số tiền trên hóa đơn đơn hàng cho nhân viên giao nhận khi nhận kiện hàng.
- Không phát sinh thêm bất kỳ khoản phí phụ thu nào khác ngoài tổng số tiền đã chốt tại trang thanh toán.
        `,
      },
      {
        id: 'payos',
        title: '3. Chuyển khoản VietQR tức thì (payOS / NAPAS247)',
        content: `
- Sau khi bấm *"Đặt hàng ngay"*, hệ thống sẽ hiển thị mã **VietQR động** chứa chính xác số tiền và nội dung chuyển khoản \`ORDER<mã_đơn_hàng>\`.
- Khách hàng mở ứng dụng ngân hàng di động (Vietcombank, MB, Techcombank, VPBank, ACB, Momo, VNPay...) và quét mã QR.
- Hệ thống máy chủ tự động kết nối qua Webhook NAPAS247 và kích hoạt trạng thái **ĐÃ THANH TOÁN** ngay lập tức trong 2-5 giây mà không cần nhân viên đối soát thủ công.
        `,
      },
      {
        id: 'security',
        title: '4. Bảo mật giao dịch & Xác nhận tự động',
        content: `
- Toàn bộ phiên giao dịch được mã hóa theo tiêu chuẩn an toàn **SSL 256-bit**.
- Mã QR VietQR có hiệu lực thanh toán trong vòng **15 phút**. Sau thời gian này, nếu chưa hoàn tất, bạn có thể tạo lại mã mới trên trang xác nhận đơn hàng.
        `,
      },
      {
        id: 'troubleshooting',
        title: '5. Xử lý sự cố giao dịch & Chuyển nhầm',
        content: `
- Trường hợp tài khoản ngân hàng của bạn đã bị trừ tiền nhưng trạng thái đơn hàng chưa cập nhật do lỗi mạng bưu điện, vui lòng liên hệ ngay Hotline **0901 234 567** kèm mã giao dịch (mã tham chiếu) để được hỗ trợ kích hoạt thủ công trong 10 phút.
        `,
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: 'Chính sách Bảo mật Thông tin',
    subtitle: 'Cam kết bảo vệ dữ liệu cá nhân, quyền riêng tư và minh bạch mục đích sử dụng thông tin của khách hàng.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'collection', title: '1. Dữ liệu chúng tôi thu thập' },
      { id: 'purpose', title: '2. Mục đích thu thập & Sử dụng dữ liệu' },
      { id: 'storage', title: '3. Lưu trữ & Bảo mật thông tin' },
      { id: 'sharing', title: '4. Chia sẻ dữ liệu với bên thứ ba' },
      { id: 'rights', title: '5. Quyền lợi của khách hàng đối với dữ liệu' },
    ],
    sections: [
      {
        id: 'collection',
        title: '1. Dữ liệu chúng tôi thu thập',
        content: `
Gritmode chỉ thu thập các thông tin cần thiết phục vụ cho quá trình giao nhận hàng và chăm sóc tài khoản:
- **Thông tin định danh:** Họ và tên, địa chỉ email, số điện thoại, ngày sinh, giới tính.
- **Thông tin giao hàng:** Địa chỉ chi tiết, phường/xã, quận/huyện, tỉnh/thành phố, ghi chú giao hàng.
- **Lịch sử mua sắm:** Danh sách đơn hàng, sản phẩm đã xem, mã giảm giá đã áp dụng.
*(Lưu ý: Gritmode KHÔNG lưu trữ mật khẩu thẻ ngân hàng hay mã OTP thanh toán của bạn).*
        `,
      },
      {
        id: 'purpose',
        title: '2. Mục đích thu thập & Sử dụng dữ liệu',
        content: `
- Xử lý đơn hàng, đóng gói và giao hàng đến địa chỉ yêu cầu.
- Gửi thông báo cập nhật hành trình đơn hàng, xác nhận thanh toán qua email/SMS.
- Cung cấp dịch vụ bảo hành, đổi trả và hỗ trợ kỹ thuật khách hàng.
- Gửi thông tin về các đợt phát hành bộ sưu tập mới (*Drop*) hoặc ưu đãi dành riêng cho thành viên (khách hàng có thể hủy nhận bất cứ lúc nào).
        `,
      },
      {
        id: 'storage',
        title: '3. Lưu trữ & Bảo mật thông tin',
        content: `
- Dữ liệu người dùng được lưu trữ trên hệ thống máy chủ bảo mật cao cấp với tường lửa và mã hóa tiêu chuẩn.
- Mọi mật khẩu đăng nhập đều được mã hóa một chiều (hashing) trước khi lưu vào cơ sở dữ liệu.
        `,
      },
      {
        id: 'sharing',
        title: '4. Chia sẻ dữ liệu với bên thứ ba',
        content: `
- Gritmode **tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào** vì mục đích thương mại.
- Thông tin giao nhận (Tên, SĐT, Địa chỉ) chỉ được cung cấp cho đối tác bưu chính vận chuyển nhằm mục đích hoàn tất giao hàng.
        `,
      },
      {
        id: 'rights',
        title: '5. Quyền lợi của khách hàng đối với dữ liệu',
        content: `
- Bạn có quyền kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân bất kỳ lúc nào tại trang **[Hồ sơ cá nhân](/profile)**.
- Bạn có quyền yêu cầu xóa bỏ tài khoản và toàn bộ dữ liệu liên quan bằng cách gửi yêu cầu đến **support@gritmode.com**.
        `,
      },
    ],
  },

  terms: {
    slug: 'terms',
    title: 'Điều khoản Dịch vụ & Sử dụng',
    subtitle: 'Các quy định và thỏa thuận sử dụng dịch vụ mua sắm trực tuyến trên nền tảng website của Gritmode®.',
    lastUpdated: '01/09/2026',
    tableOfContents: [
      { id: 'acceptance', title: '1. Chấp thuận điều khoản' },
      { id: 'account', title: '2. Tài khoản người dùng' },
      { id: 'products', title: '3. Thông tin & Giá cả sản phẩm' },
      { id: 'orders', title: '4. Xác lập đơn hàng & Hủy đơn' },
      { id: 'ip', title: '5. Quyền sở hữu trí tuệ' },
      { id: 'liability', title: '6. Giới hạn trách nhiệm' },
    ],
    sections: [
      {
        id: 'acceptance',
        title: '1. Chấp thuận điều khoản',
        content: `
Khi truy cập và tiến hành đặt mua hàng trên website của **Gritmode®**, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản dịch vụ này cùng các chính sách liên quan được công bố trên trang web.
        `,
      },
      {
        id: 'account',
        title: '2. Tài khoản người dùng',
        content: `
- Khách hàng có trách nhiệm bảo mật thông tin tài khoản, email đăng nhập và mật khẩu của mình.
- Gritmode có quyền tạm ngưng hoặc hủy bỏ quyền truy cập tài khoản nếu phát hiện các hành vi gian lận mã ưu đãi, spam hoặc gây tổn hại đến hệ thống.
        `,
      },
      {
        id: 'products',
        title: '3. Thông tin & Giá cả sản phẩm',
        content: `
- Gritmode nỗ lực hiển thị màu sắc, chất liệu và phom dáng sản phẩm chân thực nhất trên ảnh Lookbook. Tuy nhiên, màu sắc thực tế có thể chênh lệch 3-5% do ánh sáng màn hình thiết bị hiển thị.
- Giá bán niêm yết trên website là giá thanh toán cuối cùng đã bao gồm thuế và được tính bằng Việt Nam Đồng (VND).
        `,
      },
      {
        id: 'orders',
        title: '4. Xác lập đơn hàng & Hủy đơn',
        content: `
- Đơn hàng chỉ được xác nhận chính thức sau khi hệ thống gửi thông báo tạo đơn thành công và tiếp nhận thanh toán (đối với VietQR) hoặc xác nhận thông tin giao hàng COD.
- Gritmode có quyền từ chối hoặc hủy đơn hàng trong trường hợp bất khả kháng như sản phẩm hết hàng lưu kho đột xuất, lỗi hiển thị giá sai lệch nghiêm trọng do sự cố kỹ thuật.
        `,
      },
      {
        id: 'ip',
        title: '5. Quyền sở hữu trí tuệ',
        content: `
Toàn bộ logo, nhãn hiệu **Gritmode®**, hình ảnh thiết kế, hình ảnh Lookbook, văn bản mô tả và mã nguồn đều thuộc quyền sở hữu trí tuệ của Gritmode. Mọi hành vi sao chép, sử dụng lại vì mục đích thương mại mà chưa có sự đồng ý bằng văn bản đều bị nghiêm cấm.
        `,
      },
      {
        id: 'liability',
        title: '6. Giới hạn trách nhiệm',
        content: `
Gritmode cam kết xử lý thỏa đáng và bồi thường đối với các sản phẩm lỗi thuộc trách nhiệm của nhà sản xuất theo đúng quy định tại Chính sách Đổi trả & Bảo hành.
        `,
      },
    ],
  },
};
