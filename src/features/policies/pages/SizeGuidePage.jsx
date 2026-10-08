'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Breadcrumb from '../../../shared/components/Breadcrumb';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState('tees');

  const sizeCharts = {
    tees: {
      title: 'GRITMODE - BOXY T-SHIRT SIZE CHART',
      desc: 'Form áo Boxy Fit vai rơi rộng rãi, chiều dài vừa vặn ngang hông, không bó sát.',
      headers: ['Size', 'Dài áo (cm)', 'Ngang áo (cm)', 'Tay áo (cm)', 'Cân nặng (kg)'],
      rows: [
        ['S', '56', '62', '17', '< 50 kg'],
        ['M', '58', '64', '18', '< 65 kg'],
        ['L', '60', '66', '19', '< 80 kg'],
        ['XL', '62', '68', '20', '< 95 kg'],
      ],
    },
    hoodies: {
      title: 'Áo Hoodie & Sweatshirt (380GSM)',
      desc: 'Form áo dáng đứng dệt nỉ bông dày dặn, mũ trùm 2 lớp đứng phom.',
      headers: ['Size', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Dài áo (cm)', 'Ngang Áo (cm)', 'Dài tay (cm)'],
      rows: [
        ['M', '1m60 – 1m72', '50 – 65 kg', '70', '60', '58'],
        ['L', '1m72 – 1m80', '65 – 78 kg', '73', '63', '60'],
        ['XL', '1m80 – 1m90', '78 – 95 kg', '76', '66', '62'],
      ],
    },
    pants: {
      title: 'Quần Cargo & Sweatpants',
      desc: 'Form suông thoải mái (Wide-Leg), ống quần có dây rút tùy chỉnh độ túm.',
      headers: ['Size', 'Chiều cao (cm)', 'Vòng eo (cm)', 'Dài quần (cm)', 'Rộng ống (cm)'],
      rows: [
        ['S (28-29)', '1m55 – 1m68', '70 – 76', '98', '23'],
        ['M (30-31)', '1m68 – 1m75', '76 – 82', '101', '24'],
        ['L (32-33)', '1m75 – 1m82', '82 – 88', '104', '25'],
        ['XL (34-36)', '1m80 – 1m90', '88 – 96', '107', '26'],
      ],
    },
  };

  const currentChart = sizeCharts[activeTab];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">

      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Hỗ trợ mua hàng' },
              { label: 'Bảng quy đổi kích cỡ (Size Chart)', current: true },
            ]}
          />

          <h1 className="font-sans font-[550] text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-black dark:text-white">
            Bảng quy đổi kích cỡ (Size Chart)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Form dáng chuẩn streetwear của Gritmode được thiết kế theo phom dáng Boxy Fit rộng rãi. Vui lòng tham khảo bảng thông số dưới đây để chọn được size ưng ý nhất.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">

        {/* Category Switcher Tabs */}
        <div
          role="tablist"
          aria-label="Chọn loại sản phẩm"
          className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 overflow-x-auto scrollbar-none"
        >
          {[
            { id: 'tees', label: 'Áo Thun BOXY T-SHIRT' },
            { id: 'hoodies', label: 'Áo Hoodie & Sweatshirt' },
            { id: 'pants', label: 'Quần Cargo & Sweatpants' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              id={`size-tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="size-chart-panel"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-[550] uppercase tracking-wider transition-all shrink-0 cursor-pointer ${activeTab === tab.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Size Chart Table */}
        <div
          id="size-chart-panel"
          role="tabpanel"
          aria-labelledby={`size-tab-${activeTab}`}
          className="space-y-4"
        >
          <div>
            <h2 className="font-sans font-[550] text-xl uppercase tracking-widest text-black dark:text-white">
              {currentChart.title}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentChart.desc}
            </p>
          </div>

          <p id="size-chart-scroll-hint" className="text-[11px] text-neutral-400 sm:hidden">
            Vuốt ngang để xem đủ bảng thông số.
          </p>

          <div
            role="region"
            aria-label="Bảng quy đổi kích cỡ"
            aria-describedby="size-chart-scroll-hint"
            tabIndex={0}
            className="overflow-x-auto border-y border-neutral-200 dark:border-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
          >
            <table className="w-full min-w-[620px] text-left text-xs border-collapse">
              <caption className="sr-only">{currentChart.title}</caption>
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                {currentChart.headers.map((h, i) => (
                    <th
                      key={i}
                      className={`p-4 font-[550] uppercase tracking-wider text-black dark:text-white ${i === 0 ? 'sticky left-0 z-10 bg-neutral-50 dark:bg-neutral-900' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950 font-medium">
                {currentChart.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-4 ${cIdx === 0 ? 'sticky left-0 z-10 bg-white dark:bg-neutral-950 font-[550] text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400 font-mono'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measuring Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-neutral-200 dark:border-neutral-800">
          <div className="py-7 md:px-6 space-y-3 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-950">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:ruler-bold" />
            </div>
            <h3 className="font-[550] text-xs uppercase tracking-wide">Rộng ngực (Chest)</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Đo từ mép nách bên này sang mép nách bên kia của một chiếc áo thun bạn đang mặc vừa vặn nhất khi trải phẳng trên mặt bàn.
            </p>
          </div>

          <div className="py-7 md:px-6 space-y-3 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-950">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:maximize-square-bold" />
            </div>
            <h3 className="font-[550] text-xs uppercase tracking-wide">Dài áo (Length)</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Đo từ điểm cao nhất của vai áo (ngay cạnh chân cổ) thẳng xuống đến mép lai gấu áo phía dưới.
            </p>
          </div>

          <div className="py-7 md:px-6 space-y-3 last:border-b-0 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-950">
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:chat-round-dots-bold" />
            </div>
            <h3 className="font-[550] text-xs uppercase tracking-wide">Bạn phân vân giữa 2 size?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Nếu bạn thích mặc vừa người gọn gàng, hãy chọn size nhỏ hơn. Nếu bạn thích form thụng rộng cá tính, hãy chọn size lớn hơn hoặc liên hệ CSKH để được tư vấn.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="py-8 sm:py-10 border-y border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-[550] uppercase tracking-widest text-neutral-400 block">
              TƯ VẤN TRỰC TIẾP
            </span>
            <h3 className="font-sans font-[550] text-lg uppercase tracking-widest mt-0.5">
              Vẫn chưa chắc chắn về size của bạn?
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Nhắn tin trực tiếp với nhân viên tư vấn để nhận gợi ý size chính xác theo chiều cao và cân nặng.
            </p>
          </div>
          <Link href="/contact">
            <PrimaryButton className="px-6 py-3 text-xs font-[550] uppercase tracking-widest rounded-2xl shrink-0">
              Nhận tư vấn size
            </PrimaryButton>
          </Link>
        </div>

      </div>

    </div>
  );
}
