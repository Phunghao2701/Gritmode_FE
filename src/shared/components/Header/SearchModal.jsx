'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Icon from '@/shared/components/Icon';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategory';
import { formatPriceVND } from '@/features/products/utils/product.utils';

export default function SearchModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const { categoryTree } = useCategories();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const isRealtimeSearching = debouncedSearchQuery.length >= 2;
  const {
    products: searchResults = [],
    isLoadingProducts: isSearchLoading,
    total: searchTotal,
  } = useProducts(
    { search: debouncedSearchQuery, limit: 6 },
    { enabled: Boolean(isOpen && isRealtimeSearching) }
  );

  // Close search on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const dynamicCategories = (categoryTree || []).slice(0, 8).map((cat) => ({
    id: cat.category_id || cat.id,
    name: cat.name_category || cat.name,
    slug: cat.slug_category || cat.slug,
  }));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-start pt-16 sm:pt-20 px-4 sm:px-6 animate-fade-in overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-xl uppercase tracking-wider text-white">
            TÌM KIẾM SẢN PHẨM
          </span>
          <button
            onClick={() => {
              onClose();
              setSearchQuery('');
              setDebouncedSearchQuery('');
            }}
            className="p-2 text-white/70 hover:text-white text-2xl transition-colors cursor-pointer"
            aria-label="Đóng tìm kiếm"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            autoFocus
            placeholder="Nhập tên sản phẩm, bộ sưu tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b-2 border-white/60 focus:border-white py-4 pl-4 pr-24 text-lg sm:text-2xl font-bold text-white placeholder:text-white/40 focus:outline-none transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDebouncedSearchQuery('');
                }}
                className="p-1 text-white/60 hover:text-white text-lg transition-colors cursor-pointer"
                aria-label="Xóa từ khóa"
              >
                <Icon icon="solar:close-circle-bold" />
              </button>
            )}
            <button
              type="submit"
              className="p-1.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
              aria-label="Tìm kiếm"
            >
              <Icon icon="solar:arrow-right-linear" className="text-xl" />
            </button>
          </div>
        </form>

        {isRealtimeSearching ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">
                {isSearchLoading ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm (${searchTotal || searchResults.length})`}
              </p>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/products?search=${encodeURIComponent(debouncedSearchQuery)}`);
                  }}
                  className="text-xs font-bold text-white/80 hover:text-white uppercase tracking-wider underline cursor-pointer"
                >
                  Xem tất cả ({searchTotal || searchResults.length})
                </button>
              )}
            </div>

            {isSearchLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                    <div className="w-16 h-20 bg-white/10 rounded-xl shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                      <div className="h-3 bg-white/10 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchResults.map((product) => {
                  const productId = product.product_id || product.id;
                  const imageUrl = product.thumbnail || product.images?.[0]?.url_product_image;
                  const productName = product.name_product || product.name;
                  const priceVal = product.price || product.min_price || product.regular_price || 0;

                  return (
                    <div
                      key={productId}
                      onClick={() => {
                        onClose();
                        router.push(`/products/${productId}`);
                      }}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0 relative flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={productName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Icon icon="solar:t-shirt-bold" className="text-white/40 text-2xl" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {product.name_category && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 block truncate">
                            {product.name_category}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:underline">
                          {productName}
                        </h4>
                        <p className="text-xs font-black text-white/90 mt-1 tabular-nums">
                          {formatPriceVND(priceVal)}
                        </p>
                      </div>
                      <Icon icon="solar:arrow-right-linear" className="text-white/40 group-hover:text-white text-lg transition-colors shrink-0 mr-1" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 space-y-3 bg-white/5 rounded-3xl border border-white/10">
                <Icon icon="solar:magnifer-linear" className="text-3xl text-white/40 mx-auto" />
                <p className="text-sm font-bold text-white">
                  Không tìm thấy sản phẩm phù hợp với từ khóa &ldquo;{debouncedSearchQuery}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/products');
                  }}
                  className="inline-block text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Xem toàn bộ bộ sưu tập
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Danh mục nổi bật:</p>
            <div className="flex flex-wrap gap-2">
              {dynamicCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onClose();
                    router.push(`/products?category=${encodeURIComponent(cat.slug || cat.id)}`);
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
