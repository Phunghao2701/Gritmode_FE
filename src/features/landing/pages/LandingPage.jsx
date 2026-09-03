import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../products/components/ProductCard';
import { useProducts, useCategories } from '../../products/hooks/useProducts';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const { data: dbCategories = [] } = useCategories();

  const { products, isLoadingProducts: isLoading } = useProducts({ 
    category_id: activeCategoryId || undefined,
    sort: 'newest',
    limit: 15,
  });

  const heroSlides = useMemo(() => {
    const slides = products
      .map((product) => ({
        id: product.product_id || product.id,
        image: product.thumbnail || product.images?.[0]?.url_product_image,
        alt: product.name_product || product.name || 'Sản phẩm mới Gritmode',
      }))
      .filter((slide) => slide.image)
      .slice(0, 5);

    return slides.length > 0 ? slides : [{
      id: 'fallback',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1800',
      alt: 'New Arrivals',
    }];
  }, [products]);

  useEffect(() => {
    setActiveHeroIndex((current) => current % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (heroSlides.length < 2 || isHeroPaused || prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [heroSlides.length, isHeroPaused]);

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
      <section className="relative min-h-[92vh] text-white bg-black overflow-hidden select-none">
        <div
          onClick={() => navigate('/products?sort=newest')}
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          onFocusCapture={() => setIsHeroPaused(true)}
          onBlurCapture={() => setIsHeroPaused(false)}
          className="relative min-h-[92vh] flex flex-col justify-end p-8 sm:p-14 cursor-pointer group overflow-hidden"
        >
          {heroSlides.map((slide, index) => (
            (index === activeHeroIndex || index === (activeHeroIndex + 1) % heroSlides.length) && (
            <img
              key={slide.id}
              src={slide.image}
              alt={index === activeHeroIndex ? slide.alt : ''}
              aria-hidden={index !== activeHeroIndex}
              loading={index === activeHeroIndex ? 'eager' : 'lazy'}
              fetchPriority={index === activeHeroIndex ? 'high' : 'low'}
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover object-center transition-[opacity,transform] duration-[1400ms] ease-in-out motion-reduce:transition-none ${
                index === activeHeroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
              }`}
            />
            )
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-3 mb-6 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-white/80 border-b border-white/30 pb-1">
              SEASON DROP 2026
            </span>
            <h2 className="font-sans font-black text-4xl sm:text-6xl uppercase tracking-widest drop-shadow-2xl">
              Gritmode Signature
            </h2>
            <p className="text-xs text-neutral-300 max-w-lg font-[550] uppercase tracking-widest leading-relaxed">
              Thời trang đường phố Việt Nam định hình phong cách độc bản, tự do và đậm chất bụi bặm.
            </p>
            <div className="pt-3">
              <button 
                type="button"
                className="px-8 py-3.5 rounded-full border-2 border-white bg-white text-black text-xs font-[550] uppercase tracking-widest hover:bg-transparent hover:text-white transition-all duration-300 shadow-2xl cursor-pointer"
              >
                KHÁM PHÁ NGAY
              </button>
            </div>
          </div>

          {heroSlides.length > 1 && (
            <div className="relative z-10 flex justify-center gap-2 mt-4" aria-label="Chọn ảnh giới thiệu">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Xem ảnh ${index + 1}: ${slide.alt}`}
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
            onClick={() => navigate('/products')}
            className="px-8 py-3.5 rounded-full border-2 border-black dark:border-white text-black dark:text-white text-xs font-[550] uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-md cursor-pointer"
          >
            Xem tất cả bộ sưu tập
          </button>
        </div>

      </section>

    </div>
  );
}
