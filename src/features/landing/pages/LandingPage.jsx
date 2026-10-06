'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '../../products/components/ProductCard';
import { useProducts, useCategories } from '../../products/hooks/useProducts';
import { useBanners } from '../hooks/useBanners';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import Icon from '../../../shared/components/Icon';

export default function LandingPage() {
  const router = useRouter();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const { data: dbCategories = [] } = useCategories();
  const { data: heroData } = useBanners();

  const heroSettings = heroData?.settings || {};

  const { products, isLoadingProducts: isLoading } = useProducts({ 
    category_id: activeCategoryId || undefined,
    sort: 'newest',
    limit: 15,
  });

  const heroSlides = useMemo(() => {
    const uploadedSlides = (heroData?.slides || []).filter((b) => b.is_active !== false);
    return uploadedSlides.map((b) => ({
      id: b.banner_id,
      image: b.image_url,
    }));
  }, [heroData?.slides]);

  const handleHeroClick = () => {
    router.push('/products?sort=newest');
  };

  useEffect(() => {
    if (heroSlides.length === 0) return;
    setActiveHeroIndex((current) => current % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const filterTabs = [
    { id: '', label: 'TẤT CẢ' },
    ...dbCategories.map((cat) => ({
      id: String(cat.category_id || cat.id),
      label: cat.name_category || cat.name,
    })),
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-24 -mt-20">
      
      {/* 1. Cinematic Streetwear Hero Banner */}
      <section className="relative min-h-[75vh] sm:min-h-[92vh] text-white bg-black overflow-hidden select-none">
        <div
          onClick={handleHeroClick}
          className="relative min-h-[75vh] sm:min-h-[92vh] flex flex-col justify-end p-6 sm:p-14 cursor-pointer group overflow-hidden"
        >
          {heroSlides.length > 0 ? (
            heroSlides.map((slide, index) => {
              const isActive = index === activeHeroIndex;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 w-full h-full transition-[opacity,transform] duration-1000 ease-in-out motion-reduce:transition-none ${
                    isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-[1.02] z-0 pointer-events-none'
                  }`}
                  aria-hidden={!isActive}
                >
                  <Image
                    src={slide.image}
                    alt={heroSettings?.title || 'Gritmode Hero'}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    quality={90}
                    sizes="100vw"
                    className="object-cover object-center sm:object-[center_15%]"
                  />
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0 bg-neutral-950">
              {/* Subtle streetwear ambient gradient & grid background */}
              <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-950 to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(120,119,198,0.12),rgba(255,255,255,0))]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none z-10" />


          
          <div className="relative z-20 flex flex-col items-center text-center space-y-3 mb-6 max-w-2xl mx-auto px-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/80 border-b border-white/30 pb-1">
              {heroSettings?.subtitle || 'SEASON DROP 2026'}
            </span>
            <h2 className="font-sans font-black text-3xl sm:text-6xl uppercase tracking-widest drop-shadow-2xl">
              {heroSettings?.title || 'GRITMODE SIGNATURE'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-lg font-[550] uppercase tracking-widest leading-relaxed">
              {heroSettings?.description || 'Thời trang đường phố Việt Nam định hình phong cách độc bản, tự do và đậm chất bụi bặm.'}
            </p>
            <div className="pt-3">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHeroClick();
                }}
                className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full border-2 border-white bg-white text-black text-xs font-[550] uppercase tracking-widest hover:bg-transparent hover:text-white transition-all duration-300 shadow-2xl cursor-pointer"
              >
                KHÁM PHÁ NGAY
              </button>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <div className="relative z-20 flex justify-center gap-2 mt-4" aria-label="Chọn ảnh giới thiệu">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  type="button"
                  aria-label={`Xem ảnh ${index + 1}`}
                  aria-current={index === activeHeroIndex}
                  onClick={(event) => {
                    event.stopPropagation();
                    setActiveHeroIndex(index);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    index === activeHeroIndex ? 'w-8 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* 3. New Arrivals Catalog Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header with Title and Dynamic Category Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white tracking-widest uppercase mt-0.5">
              New Arrivals
            </h2>
          </div>

          {/* Sub-category Filter Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto pb-1 text-md text-neutral-400 select-none scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryId(tab.id)}
                className={`transition-all whitespace-nowrap cursor-pointer uppercase py-1 ${
                  activeCategoryId === tab.id
                    ? 'text-black dark:text-white font-[550] border-b-2 border-black dark:border-white'
                    : 'font-normal text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Column Product Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="space-y-3">
                <div className="aspect-[3/4] w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                <LoadingSkeleton height="1rem" width="75%" className="rounded-lg" />
                <LoadingSkeleton height="1rem" width="45%" className="rounded-lg" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Chưa có sản phẩm"
              description="Hiện chưa có sản phẩm nào trong danh mục này. Vui lòng quay lại sau hoặc khám phá các danh mục khác."
              icon="solar:bag-smile-linear"
              actionLabel={activeCategoryId ? "Xem tất cả sản phẩm" : undefined}
              onAction={activeCategoryId ? () => setActiveCategoryId('') : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 animate-fade-in">
            {products.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))}
          </div>
        )}

        {/* View All Products CTA */}
        <div className="text-center pt-6">
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="px-8 py-3.5 rounded-full border-2 border-black dark:border-white text-black dark:text-white text-xs font-[550] uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-md cursor-pointer"
          >
            Xem tất cả bộ sưu tập
          </button>
        </div>

      </section>

    </div>
  );
}
