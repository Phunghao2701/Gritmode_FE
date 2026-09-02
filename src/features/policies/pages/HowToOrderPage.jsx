import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function HowToOrderPage() {
  const steps = [
    {
      step: '01',
      title: 'Lựa chọn sản phẩm & Chọn size phù hợp',
      desc: 'Duyệt qua các danh mục Áo thun, Hoodie, Quần Cargo trên trang web. Chọn màu sắc và kích cỡ (Size S/M/L/XL) dựa theo Bảng quy đổi kích cỡ, sau đó bấm "Thêm vào giỏ hàng".',
      icon: 'solar:bag-3-bold',
    },
    {
      step: '02',
      title: 'Kiểm tra giỏ hàng & Nhập mã ưu đãi',
      desc: 'Mở giỏ hàng để kiểm tra lại danh sách món đồ, số lượng và tổng tiền. Bạn có thể nhập mã giảm giá (Voucher) để nhận chiết khấu trực tiếp.',
      icon: 'solar:ticket-bold',
    },
    {
      step: '03',
      title: 'Điền địa chỉ giao hàng & Chọn phương thức thanh toán',
      desc: 'Nhập thông tin người nhận, số điện thoại và địa chỉ giao hàng. Lựa chọn hình thức thanh toán thuận tiện: Tiền mặt khi nhận hàng (COD) hoặc Chuyển khoản VietQR tức thì.',
      icon: 'solar:card-send-bold',
    },
    {
      step: '04',
      title: 'Nhận hàng & Kiểm tra sản phẩm',
      desc: 'Đơn hàng được đóng gói và giao tận tay bạn hoàn toàn miễn phí (Freeship 0đ). Bạn được mở kiện hàng kiểm tra trước khi thanh toán và được hỗ trợ đổi size trong 7 ngày.',
      icon: 'solar:box-minimalistic-bold',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-neutral-400">Hỗ trợ mua hàng</span>
            <span>/</span>
            <span className="text-black dark:text-white">Hướng dẫn mua hàng</span>
          </nav>

          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
            HOW TO BUY ON GRITMODE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black dark:text-white">
            Hướng dẫn mua hàng & Thanh toán
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Chỉ với 4 bước đơn giản, bạn có thể dễ dàng sở hữu những thiết kế streetwear độc bản và nhận hàng nhanh chóng ngay tại nhà.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl">
                  <Icon icon={s.icon} />
                </div>
                <span className="font-display font-black text-3xl text-neutral-300 dark:text-neutral-700">
                  {s.step}
                </span>
              </div>

              <h3 className="font-display font-black text-base uppercase tracking-tight text-black dark:text-white">
                {s.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Methods Explained */}
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              PAYMENT OPTIONS
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">
              Phương thức thanh toán được hỗ trợ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h4 className="font-black uppercase text-sm flex items-center gap-2">
                <Icon icon="solar:hand-money-bold" className="text-base" />
                <span>1. Thanh toán khi nhận hàng (COD)</span>
              </h4>
              <p className="text-neutral-500 leading-relaxed">
                Thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã kiểm tra đúng kiện hàng của mình. An toàn và không cần thẻ ngân hàng.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h4 className="font-black uppercase text-sm flex items-center gap-2">
                <Icon icon="solar:qr-code-bold" className="text-base" />
                <span>2. Chuyển khoản VietQR (payOS / NAPAS247)</span>
              </h4>
              <p className="text-neutral-500 leading-relaxed">
                Quét mã QR bằng ứng dụng ngân hàng di động bất kỳ. Hệ thống tự động xác nhận đơn hàng ngay lập tức trong 2 giây mà không cần gửi ủy nhiệm chi.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-black text-white text-center space-y-4">
          <h3 className="font-display font-black text-2xl uppercase">
            Bắt đầu mua sắm cùng Gritmode
          </h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Hàng trăm mẫu thiết kế streetwear độc bản đang chờ đón bạn.
          </p>
          <div className="pt-2">
            <Link to="/products">
              <PrimaryButton
                variant="secondary"
                className="px-8 py-3.5 text-xs font-black uppercase tracking-widest rounded-full"
              >
                Khám phá ngay
              </PrimaryButton>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
