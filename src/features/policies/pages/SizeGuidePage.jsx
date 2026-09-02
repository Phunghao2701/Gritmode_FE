import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function SizeGuidePage() {
  const [activeTab, setActiveTab] = useState('tees');

  const sizeCharts = {
    tees: {
      title: 'Áo Thun Oversized (Heavyweight 280GSM)',
      desc: 'Form áo Boxy Fit vai rơi rộng rãi, chiều dài vừa vặn ngang hông, không bó sát.',
      headers: ['Size', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Dài áo (cm)', 'Rộng ngực (cm)', 'Dài tay (cm)'],
      rows: [
        ['S', '1m55 – 1m68', '45 – 58 kg', '68', '54', '22'],
        ['M', '1m68 – 1m75', '58 – 70 kg', '71', '57', '23.5'],
        ['L', '1m75 – 1m82', '70 – 82 kg', '74', '60', '25'],
        ['XL', '1m80 – 1m90', '82 – 98 kg', '77', '63', '26.5'],
      ],
    },
    hoodies: {
      title: 'Áo Hoodie & Sweatshirt (380GSM)',
      desc: 'Form áo dáng đứng dệt nỉ bông dày dặn, mũ trùm 2 lớp đứng phom.',
      headers: ['Size', 'Chiều cao (cm)', 'Cân nặng (kg)', 'Dài áo (cm)', 'Rộng ngực (cm)', 'Dài tay (cm)'],
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
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-neutral-400">Hỗ trợ mua hàng</span>
            <span>/</span>
            <span className="text-black dark:text-white">Bảng quy đổi kích cỡ (Size Chart)</span>
          </nav>

          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
            FIT & SIZING GUIDE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black dark:text-white">
            Bảng quy đổi kích cỡ (Size Chart)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Form dáng chuẩn streetwear của Gritmode được thiết kế theo phom dáng Boxy Fit rộng rãi. Vui lòng tham khảo bảng thông số dưới đây để chọn được size ưng ý nhất.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        
        {/* Category Switcher Tabs */}
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'tees', label: 'Áo Thun Oversized (Tees)' },
            { id: 'hoodies', label: 'Áo Hoodie & Sweatshirt' },
            { id: 'pants', label: 'Quần Cargo & Sweatpants' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Size Chart Table */}
        <div className="space-y-4">
          <div>
            <h2 className="font-display font-black text-xl uppercase tracking-tight text-black dark:text-white">
              {currentChart.title}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentChart.desc}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  {currentChart.headers.map((h, i) => (
                    <th key={i} className="p-4 font-black uppercase tracking-wider text-black dark:text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-950 font-medium">
                {currentChart.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className={`p-4 ${cIdx === 0 ? 'font-black text-black dark:text-white' : 'text-neutral-600 dark:text-neutral-400 font-mono'}`}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:ruler-bold" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-tight">Rộng ngực (Chest)</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Đo từ mép nách bên này sang mép nách bên kia của một chiếc áo thun bạn đang mặc vừa vặn nhất khi trải phẳng trên mặt bàn.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:maximize-square-bold" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-tight">Dài áo (Length)</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Đo từ điểm cao nhất của vai áo (ngay cạnh chân cổ) thẳng xuống đến mép lai gấu áo phía dưới.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-base">
              <Icon icon="solar:chat-round-dots-bold" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-tight">Bạn phân vân giữa 2 size?</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Nếu bạn thích mặc vừa người gọn gàng, hãy chọn size nhỏ hơn. Nếu bạn thích form thụng rộng cá tính, hãy chọn size lớn hơn hoặc liên hệ CSKH để được tư vấn.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
              TƯ VẤN TRỰC TIẾP
            </span>
            <h3 className="font-display font-black text-lg uppercase tracking-tight mt-0.5">
              Vẫn chưa chắc chắn về size của bạn?
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Nhắn tin trực tiếp với nhân viên tư vấn để nhận gợi ý size chính xác theo chiều cao và cân nặng.
            </p>
          </div>
          <Link to="/contact">
            <PrimaryButton className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl shrink-0">
              Nhận tư vấn size
            </PrimaryButton>
          </Link>
        </div>

      </div>

    </div>
  );
}
