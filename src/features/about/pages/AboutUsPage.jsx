'use client';
import React from 'react';
import Link from 'next/link';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function AboutUsPage() {
  const values = [
    {
      icon: 'solar:shield-star-bold',
      title: 'Chất liệu nguyên bản (Raw & Heavyweight)',
      desc: 'Cotton chải kỹ 280–380GSM, xử lý co rút để giữ form boxy bền lâu.',
    },
    {
      icon: 'solar:scissors-square-bold',
      title: 'Kỹ thuật may thủ công chần kép (Reinforced Seams)',
      desc: 'Đường may gia cố và bo cổ dệt kép giúp sản phẩm bền dáng qua thời gian.',
    },
    {
      icon: 'solar:flag-bold',
      title: 'Tự hào tay nghề thợ may Việt Nam (Made in Vietnam)',
      desc: 'Đồng hành cùng các xưởng dệt may lâu năm và người thợ Việt.',
    },
    {
      icon: 'solar:fire-bold',
      title: 'Tinh thần không thỏa hiệp (The Grit Ethos)',
      desc: 'Limited Drop dành cho những người chọn cá tính riêng thay vì fast-fashion.',
    },
  ];

  const milestones = [
    {
      year: '2024',
      title: 'Khởi đầu từ xưởng may nhỏ tại Sài Gòn',
      desc: 'Bắt đầu với mục tiêu tạo ra heavyweight streetwear chất lượng cao tại Việt Nam.',
    },
    {
      year: '2025',
      title: 'Mở rộng bộ sưu tập & Flagship Store',
      desc: 'Mở rộng từ áo thun sang hoodie, cargo và không gian flagship đầu tiên.',
    },
    {
      year: '2026',
      title: 'Hệ sinh thái thời trang Streetwear đương đại',
      desc: 'Xây dựng trải nghiệm mua sắm số và kết nối cộng đồng streetwear toàn quốc.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Hero Section */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-16 sm:py-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-[550] uppercase tracking-widest">
            <span>GRITMODE® MANIFESTO</span>
          </div>

          <h1 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-black dark:text-white max-w-4xl mx-auto leading-tight">
            Định hình bản lĩnh đường phố từ chất liệu nguyên bản
          </h1>

          <p className="text-xs sm:text-sm font-normal text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Gritmode đại diện cho tinh thần kiên định, bền bỉ và không thỏa hiệp.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
        
        {/* 2. Story / Manifesto Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-sans font-[550] text-2xl sm:text-3xl uppercase tracking-widest leading-snug">
              "Thời trang thực sự bắt đầu khi sự bền bỉ gặp gỡ tính duy mỹ."
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
              <p>
                Sinh ra tại Sài Gòn, Gritmode bắt đầu từ mong muốn tạo ra streetwear heavyweight chất lượng cao ngay tại Việt Nam.
              </p>
              <p>
                Từ chất liệu, form boxy đến kỹ thuật in, mọi chi tiết đều được chọn để sản phẩm bền và dễ mặc mỗi ngày.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 bg-neutral-900 text-white space-y-6 relative overflow-hidden border-y border-neutral-700">
            <div className="relative z-10 space-y-4">
              <span className="text-4xl font-sans font-[550] text-white">
                280<span className="text-xl">GSM+</span>
              </span>
              <h3 className="font-sans font-[550] text-xl uppercase tracking-widest">
                Tiêu chuẩn Heavyweight Cotton đỉnh cao
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Chất liệu dày dặn, đứng form và thoải mái cho nhịp sống đường phố.
              </p>
            </div>
            
            {/* Background Aesthetic Watermark */}
            <div className="absolute right-2 bottom-2 text-8xl font-[550] text-white/5 select-none pointer-events-none font-sans">
              GRIT
            </div>
          </div>
        </div>

        {/* 3. Core Values Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest">
              4 Trụ Cột Giá Trị Của Gritmode
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-neutral-200 dark:border-neutral-800">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="py-7 md:px-8 space-y-3 border-b md:border-b-0 md:border-r last:border-b-0 md:last:border-r-0 border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-950"
              >
                <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-xl">
                  <Icon icon={v.icon} />
                </div>
                <h3 className="font-sans font-[550] text-sm uppercase tracking-wide text-black dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Journey Timeline */}
        <div className="py-8 sm:py-12 border-y border-neutral-200 dark:border-neutral-800 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="font-sans font-[550] text-2xl sm:text-3xl uppercase tracking-widest">
              Hành Trình Kiến Tạo Thương Hiệu
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-2 border-t border-neutral-300 dark:border-neutral-700 pt-4">
                <span className="font-sans font-[550] text-2xl text-black dark:text-white">
                  {m.year}
                </span>
                <h3 className="font-sans font-[550] text-sm uppercase tracking-wide text-black dark:text-white">
                  {m.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Bottom CTA Banner */}
        <div className="p-10 sm:p-16 rounded-3xl bg-black text-white text-center space-y-6">
          <h2 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest max-w-2xl mx-auto">
            Khám phá những thiết kế Streetwear mới nhất
          </h2>
          <p className="text-xs sm:text-sm font-normal text-neutral-400 max-w-md mx-auto leading-relaxed">
            Chất lượng vải và form dáng nguyên bản, sẵn sàng cho nhịp sống đường phố.
          </p>
          <div className="pt-2">
            <Link href="/products">
              <PrimaryButton
                variant="secondary"
                className="px-8 py-3.5 uppercase tracking-widest text-xs font-[550] rounded-full"
              >
                Khám phá Bộ sưu tập
              </PrimaryButton>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
