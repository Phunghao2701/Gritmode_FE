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
    (Array.isArray(product.images) && product.images[0]?.url_product_image) ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600';

  const minPrice = product.min_price !== undefined ? product.min_price : product.price;
  const maxPrice = product.max_price !== undefined ? product.max_price : product.price;
  const isAvailable = product.is_available !== undefined ? product.is_available : true;
  const formattedPrice = formatProductPriceRange(minPrice, maxPrice);

  return (
    <div
      onClick={() => navigate(`/products/${productId}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer select-none flex flex-col space-y-2.5 relative"
    >
      {/* Product Image Flatlay Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-3 flex items-center justify-center transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 shadow-sm">
        
        {/* Product Photo */}
        <img
          src={thumbnail}
          alt={name}
          className={`w-full h-full object-contain object-center transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          loading="lazy"
        />

        {/* Availability Badge / Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-3 py-1 rounded-full shadow-lg">
              Tạm hết hàng
            </span>
          </div>
        )}

        {/* Quick View Icon Button */}
        <div className="absolute right-3 bottom-3 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-black/95 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon icon="solar:eye-linear" className="text-base" />
        </div>
      </div>

      {/* Product Title & Price Details */}
      <div className="space-y-1 pt-0.5">
        <h3 className="font-sans font-bold text-xs text-black dark:text-white line-clamp-1 group-hover:opacity-75 transition-opacity">
          {name}
        </h3>
        
        <div className="font-black text-xs text-black dark:text-white">
          {formattedPrice}
        </div>
      </div>
    </div>
  );
}
