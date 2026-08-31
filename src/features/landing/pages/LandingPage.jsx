import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import ProductCard from '../../products/components/ProductCard';
import { useProducts, useCategories } from '../../products/hooks/useProducts';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState('');

  const { data: dbCategories = [] } = useCategories();

  const { products, isLoadingProducts: isLoading } = useProducts({ 
    category_id: activeCategoryId || undefined,
    limit: 20,
  });

  const splitHeroBanners = [
    {
      id: 'left',
      subTitle: 'New Drop',
      title: 'New Arrivals',
      image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1200',
      link: '/products',
    },
    {
      id: 'right',
      subTitle: 'Streetwear Collection',
      title: 'Trending Fits',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1200',
      link: '/products',
    }
  ];

  const filterTabs = [
    { id: '', label: 'TẤT CẢ' },
    ...dbCategories.map((cat) => ({
      id: String(cat.category_id || cat.id),
      label: cat.name_category || cat.name,
    })),
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 -mt-20">
      
      {/* 1. Split Dual Hero Section */}
      <section className="relative min-h-[92vh] grid grid-cols-1 md:grid-cols-2 text-white bg-black overflow-hidden select-none">
        
        {/* Left Action Banner */}
        <div 
          onClick={() => navigate(splitHeroBanners[0].link)}
          className="relative min-h-[60vh] md:min-h-[92vh] flex flex-col justify-end p-8 sm:p-14 cursor-pointer group overflow-hidden border-b md:border-b-0 md:border-r border-white/10"
        >
          <img
            src={splitHeroBanners[0].image}
            alt="New Arrivals Left"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-2 mb-4">
            <span className="text-xs sm:text-sm font-semibold text-white/80 tracking-wider">
              {splitHeroBanners[0].subTitle}
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight drop-shadow-md">
              {splitHeroBanners[0].title}
            </h2>
            <div className="pt-2">
              <button className="px-6 py-2 rounded-full border border-white/60 bg-white/15 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg cursor-pointer">
                SHOP NOW
              </button>
            </div>
          </div>
        </div>

        {/* Right Action Banner */}
        <div 
          onClick={() => navigate(splitHeroBanners[1].link)}
          className="relative min-h-[60vh] md:min-h-[92vh] flex flex-col justify-end p-8 sm:p-14 cursor-pointer group overflow-hidden"
        >
          <img
            src={splitHeroBanners[1].image}
            alt="New Arrivals Right"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-2 mb-4">
            <span className="text-xs sm:text-sm font-semibold text-white/80 tracking-wider">
              {splitHeroBanners[1].subTitle}
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight drop-shadow-md">
              {splitHeroBanners[1].title}
            </h2>
            <div className="pt-2">
              <button className="px-6 py-2 rounded-full border border-white/60 bg-white/15 backdrop-blur-md text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-lg cursor-pointer">
                SHOP NOW
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 2. New Arrivals Section with Dynamic Categories */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        
        {/* Header with Title and Dynamic Category Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight uppercase">
            New Arrivals
          </h2>

          {/* Sub-category Filter Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto pb-1 text-xs font-medium text-neutral-400 select-none scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryId(tab.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer uppercase ${
                  activeCategoryId === tab.id
                    ? 'text-black dark:text-white font-black underline underline-offset-8 decoration-2'
                    : 'hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Column Product Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="space-y-3">
                <LoadingSkeleton height="280px" className="rounded-xl" />
                <LoadingSkeleton height="1rem" width="70%" />
                <LoadingSkeleton height="1rem" width="40%" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Chưa có sản phẩm"
              description="Hiện chưa có sản phẩm nào trong danh mục này. Vui lòng quay lại sau hoặc khám phá các danh mục khác."
              icon="solar:bag-smile-linear"
              actionLabel={activeCategoryId ? "Xem tất cả sản phẩm" : undefined}
              onAction={activeCategoryId ? () => setActiveCategoryId('') : undefined}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product.product_id} product={product} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
}
