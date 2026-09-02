import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { formatProductPriceRange } from '../utils/product.utils';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const productId = product.product_id || product.id;
  const name = product.name_product || product.title || product.name || 'Sản phẩm Gritmode';
  const thumbnail =
    product.thumbnail ||
    product.url_product_image ||
    (Array.isArray(product.images) && (product.images[0]?.url_product_image || (typeof product.images[0] === 'string' ? product.images[0] : null))) ||
    null;

  const minPrice = product.min_price !== undefined ? product.min_price : product.price;
  const maxPrice = product.max_price !== undefined ? product.max_price : product.price;
  const isAvailable = product.is_available !== undefined ? product.is_available : true;
  const formattedPrice = formatProductPriceRange(minPrice, maxPrice);

  // Category name or tag
  const primaryCategory = product.categories?.find((c) => c.is_primary)?.name_category || product.category_name || '';

  return (
    <div
      onClick={() => navigate(`/products/${productId}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer select-none flex flex-col space-y-3 relative transition-all duration-300"
    >
      {/* Product Image Lookbook Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 p-3 flex items-center justify-center transition-all duration-300 group-hover:border-neutral-400 dark:group-hover:border-neutral-600 group-hover:shadow-md shadow-sm">

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          <span className="text-[9px] font-normal uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-md shadow-sm">
            FREESHIP
          </span>
        </div>

        {/* Product Photo */}
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className={`w-full h-full object-contain object-center transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'
              }`}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 gap-1.5">
            <Icon icon="solar:t-shirt-bold-duotone" className="text-5xl opacity-40" />
            <span className="text-[9px] uppercase tracking-widest font-normal text-neutral-400">Gritmode</span>
          </div>
        )}

        {/* Availability Badge / Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-[10px] font-normal uppercase tracking-widest bg-white text-black px-3.5 py-1 rounded-full shadow-xl">
              Tạm hết hàng
            </span>
          </div>
        )}

        {/* Floating Quick Action Pill on Hover */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none sm:pointer-events-auto">
          <div className="w-full py-2.5 rounded-xl bg-black/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-[11px] font-normal uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg">
            <Icon icon="solar:eye-linear" className="text-sm" />
            <span>Xem chi tiết</span>
          </div>
        </div>
      </div>

      {/* Product Meta Details */}
      <div className="space-y-1 px-1">
        {primaryCategory && (
          <span className="text-[10px] font-normal uppercase tracking-wider text-neutral-400 block line-clamp-1">
            {primaryCategory}
          </span>
        )}

        <h3 className="font-sans font-normal text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 uppercase tracking-wider line-clamp-1 group-hover:text-black dark:group-hover:text-white transition-colors">
          {name}
        </h3>

        <div className="font-sans font-normal font-[550] text-xs sm:text-sm text-black dark:text-white tracking-normal pt-0.5">
          {formattedPrice}
        </div>
      </div>
    </div>
  );
}
