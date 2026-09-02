import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';

export default function PolicyLayout({
  title,
  subtitle,
  lastUpdated = '01/09/2026',
  tableOfContents = [],
  sections = [],
  activeSlug,
}) {
  const [activeSection, setActiveSection] = useState(tableOfContents[0]?.id || '');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const item of tableOfContents) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  const allPolicies = [
    { slug: 'return', label: 'Đổi trả & Hoàn tiền', path: '/policies/return' },
    { slug: 'shipping', label: 'Vận chuyển & Giao hàng', path: '/policies/shipping' },
    { slug: 'warranty', label: 'Bảo hành sản phẩm', path: '/policies/warranty' },
    { slug: 'payment', label: 'Quy định thanh toán', path: '/policies/payment' },
    { slug: 'privacy', label: 'Bảo mật thông tin', path: '/policies/privacy' },
    { slug: 'terms', label: 'Điều khoản dịch vụ', path: '/policies/terms' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 py-12 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-neutral-400">Chính sách</span>
            <span>/</span>
            <span className="text-black dark:text-white">{title}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                GRITMODE® CUSTOMER POLICY
              </span>
              <h1 className="font-display font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-black dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Last Updated Badge */}
            <div className="shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-200/60 dark:bg-neutral-800/60 border border-neutral-300/60 dark:border-neutral-700/60 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 self-start md:self-auto">
              <Icon icon="solar:clock-circle-linear" className="text-sm" />
              <span>Cập nhật lần cuối: {lastUpdated}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Content Grid with Sticky Table of Contents */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT SIDEBAR: Table of Contents & Quick Navigation (4 cols) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Table of Contents Box */}
            {tableOfContents.length > 0 && (
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm">
                <h3 className="font-display font-black text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-2">
                  <Icon icon="solar:list-bold" className="text-base" />
                  <span>Mục lục nội dung</span>
                </h3>
                <nav className="space-y-1 text-xs">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block py-1.5 px-3 rounded-xl transition-all ${
                        activeSection === item.id
                          ? 'font-black bg-black text-white dark:bg-white dark:text-black shadow-sm'
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Other Policies Switcher Box */}
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-neutral-400">
                Tất cả chính sách
              </h4>
              <nav className="space-y-1.5 text-xs">
                {allPolicies.map((p) => {
                  const isCurrent = activeSlug === p.slug;
                  return (
                    <Link
                      key={p.slug}
                      to={p.path}
                      className={`flex items-center justify-between py-2 px-3 rounded-xl transition-all ${
                        isCurrent
                          ? 'font-black bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <span>{p.label}</span>
                      <Icon icon="solar:arrow-right-linear" className="text-xs text-neutral-400" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Need Direct Help Card */}
            <div className="p-6 rounded-3xl bg-black text-white space-y-3 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                CẦN HỖ TRỢ TRỰC TIẾP?
              </span>
              <h4 className="font-display font-black text-sm uppercase">
                Liên hệ đội ngũ CSKH Gritmode
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Hotline hỗ trợ 08:30 – 22:00: <strong className="text-white font-sans">0901 234 567</strong>
              </p>
              <div className="pt-1">
                <Link to="/contact">
                  <PrimaryButton
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center text-xs font-black uppercase"
                  >
                    Gửi yêu cầu hỗ trợ
                  </PrimaryButton>
                </Link>
              </div>
            </div>

          </aside>

          {/* RIGHT: Main Policy Text Content (8 cols / ~800px max reading width) */}
          <main className="lg:col-span-8 max-w-3xl space-y-10">
            {sections.map((sec) => (
              <section 
                key={sec.id} 
                id={sec.id} 
                className="scroll-mt-28 space-y-3 pb-8 border-b border-neutral-100 dark:border-neutral-900"
              >
                <h2 className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-black dark:text-white">
                  {sec.title}
                </h2>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-3 prose dark:prose-invert max-w-none">
                  {sec.content.split('\n\n').map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Bullet lists
                    if (trimmed.startsWith('- ') || trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
                      const listLines = trimmed.split('\n');
                      return (
                        <ul key={pIdx} className="space-y-2 pl-4 list-disc marker:text-black dark:marker:text-white">
                          {listLines.map((line, lIdx) => {
                            const cleanLine = line.replace(/^[-*]\s+|\d+\.\s+/, '');
                            return (
                              <li key={lIdx} className="leading-relaxed" dangerouslySetInnerHTML={{
                                __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black dark:text-white font-black">$1</strong>')
                              }} />
                            );
                          })}
                        </ul>
                      );
                    }

                    return (
                      <p key={pIdx} className="leading-relaxed" dangerouslySetInnerHTML={{
                        __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black dark:text-white font-black">$1</strong>')
                      }} />
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Bottom Cross Navigation */}
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block">
                  BẠN ĐÃ SẴN SÀNG MUA SẮM?
                </span>
                <h4 className="font-display font-black text-base uppercase text-black dark:text-white mt-0.5">
                  Khám phá BST Streetwear mới nhất
                </h4>
              </div>
              <Link to="/products">
                <PrimaryButton className="px-6 py-3 text-xs font-black uppercase tracking-widest rounded-2xl">
                  Xem sản phẩm
                </PrimaryButton>
              </Link>
            </div>
          </main>

        </div>
      </div>

    </div>
  );
}
