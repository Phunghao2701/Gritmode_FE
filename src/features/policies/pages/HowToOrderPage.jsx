'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Breadcrumb from '../../../shared/components/Breadcrumb';

export default function HowToOrderPage() {
  const steps = [
    {
      step: '01',
      title: 'Lựa chọn sản phẩm & Chọn size phù hợp',
      desc: 'Chọn sản phẩm, màu và size theo Bảng quy đổi kích cỡ, sau đó thêm vào giỏ hàng.',
      icon: 'solar:bag-3-bold',
    },
    {
      step: '02',
      title: 'Kiểm tra giỏ hàng & Nhập mã ưu đãi',
      desc: 'Kiểm tra sản phẩm, số lượng và nhập voucher nếu có.',
      icon: 'solar:ticket-bold',
    },
    {
      step: '03',
      title: 'Điền địa chỉ giao hàng & Chọn phương thức thanh toán',
      desc: 'Nhập thông tin giao hàng và chọn COD hoặc thanh toán trực tuyến qua payOS.',
      icon: 'solar:card-send-bold',
    },
    {
      step: '04',
      title: 'Nhận hàng & Kiểm tra sản phẩm',
      desc: 'Nhận hàng, kiểm tra sản phẩm và yêu cầu đổi size trong 7 ngày nếu cần.',
      icon: 'solar:box-minimalistic-bold',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Hỗ trợ mua hàng' },
              { label: 'Hướng dẫn mua hàng', current: true },
            ]}
          />

          <h1 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-black dark:text-white">
            Hướng dẫn mua hàng & Thanh toán
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            4 bước đơn giản để chọn sản phẩm, thanh toán và nhận hàng tại nhà.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-neutral-200 dark:border-neutral-800">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className={`py-7 md:px-8 space-y-3 border-b last:border-b-0 md:border-b-0 ${idx % 2 === 0 ? 'md:border-r' : ''} ${idx >= 2 ? 'md:border-t' : ''} border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-950`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
                  <Icon icon={s.icon} />
                </div>
                <span className="font-sans font-[550] text-3xl text-neutral-300 dark:text-neutral-700">
                  {s.step}
                </span>
              </div>

              <h3 className="font-sans font-[550] text-sm uppercase tracking-wide text-black dark:text-white">
                {s.title}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Methods Explained */}
        <div className="py-8 sm:py-10 border-y border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="space-y-1">
            <h2 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest">
              Phương thức thanh toán được hỗ trợ
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-y border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="py-6 sm:pr-6 space-y-2 border-b sm:border-b-0 sm:border-r border-neutral-200 dark:border-neutral-800">
              <h4 className="font-[550] uppercase text-sm tracking-wide flex items-center gap-2">
                <Icon icon="solar:hand-money-bold" className="text-base" />
                <span>1. Thanh toán khi nhận hàng (COD)</span>
              </h4>
              <p className="text-neutral-500 leading-relaxed">
                Thanh toán khi nhận hàng sau khi kiểm tra đúng kiện hàng.
              </p>
            </div>

            <div className="py-6 sm:pl-6 space-y-2">
              <h4 className="font-[550] uppercase text-sm tracking-wide flex items-center gap-2">
                <Icon icon="solar:shield-check-bold" className="text-base" />
                <span>2. Thanh toán trực tuyến qua payOS</span>
              </h4>
              <p className="text-neutral-500 leading-relaxed">
                Thanh toán trực tuyến qua payOS; hệ thống tự động xác nhận khi giao dịch hoàn tất.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-7 sm:py-8 border-y border-neutral-200 dark:border-neutral-800 text-center space-y-3">
          <h3 className="font-sans font-[550] text-xl sm:text-2xl uppercase tracking-widest">
            Bắt đầu mua sắm cùng Gritmode
          </h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Khám phá các thiết kế streetwear mới nhất của Gritmode.
          </p>
          <div className="pt-1">
            <Link href="/products">
              <PrimaryButton
                variant="primary"
                className="px-8 py-3.5 text-xs font-[550] uppercase tracking-widest rounded-full"
              >
                Xem sản phẩm
              </PrimaryButton>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
