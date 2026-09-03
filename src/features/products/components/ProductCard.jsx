import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import { queryClient } from '../../../shared/services/queryClient';
import { getProductDetailApi } from '../apis/product.api';
import {
  formatProductPriceRange,
  getProductImageSrcSet,
  getSizedProductImageUrl,
  slugifyProductName,
} from '../utils/product.utils';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const name = product.name_product || product.title || product.name || 'Sản phẩm Gritmode';
  const productSlug = product.slug_product || slugifyProductName(name);
  const thumbnail =
    product.thumbnail ||
    product.url_product_image ||
    (Array.isArray(product.images) && (product.images[0]?.url_product_image || (typeof product.images[0] === 'string' ? product.images[0] : null))) ||
    null;

  const minPrice = product.min_price !== undefined ? product.min_price : product.price;
  const maxPrice = product.max_price !== undefined ? product.max_price : product.price;
  const originalMinPrice = product.original_min_price ?? minPrice;
  const originalMaxPrice = product.original_max_price ?? maxPrice;
  const isAvailable = product.is_available !== undefined ? product.is_available : true;
  const hasSale = originalMinPrice > minPrice || originalMaxPrice > maxPrice;
  const discountPercent = hasSale && originalMinPrice > 0
    ? Math.round((1 - minPrice / originalMinPrice) * 100)
    : 0;
  const formattedPrice = formatProductPriceRange(minPrice, maxPrice);
  const formattedOriginalPrice = formatProductPriceRange(originalMinPrice, originalMaxPrice);

  // Category name or tag
  const primaryCategory = product.categories?.find((c) => c.is_primary)?.name_category || product.category_name || '';

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (productSlug) {
      queryClient.prefetchQuery({
        queryKey: ['product-detail', productSlug],
        queryFn: async () => {
          const res = await getProductDetailApi(productSlug);
          return res.data?.data || res.data;
        },
        staleTime: 1000 * 60 * 3,
      });
      import('../pages/ProductDetailPage');
    }
  }, [productSlug]);

  return (
    <div
      onClick={() => navigate(`/products/${productSlug}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer select-none flex flex-col space-y-3 relative transition-all duration-300"
    >
      {/* Product Image Lookbook Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-center transition-all duration-300 shadow-sm">

        {/* Product Photo */}
        {thumbnail ? (
          <img
            src={getSizedProductImageUrl(thumbnail, 640)}
            srcSet={getProductImageSrcSet(thumbnail)}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            alt={name}
            className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out ${isHovered ? 'scale-105' : 'scale-100'
              }`}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 gap-1.5">
            <Icon icon="solar:t-shirt-bold-duotone" className="text-5xl opacity-40" />
            <span className="text-[9px] uppercase tracking-widest font-normal text-neutral-400">Gritmode</span>
          </div>
        )}

        {hasSale && discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 rounded-md bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Availability Badge / Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-[10px] font-normal uppercase tracking-widest bg-white text-black px-3.5 py-1 rounded-full shadow-xl">
              Tạm hết hàng
            </span>
          </div>
        )}


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

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-sans text-xs sm:text-sm tracking-normal pt-0.5">
          {hasSale && (
            <span className="text-neutral-400 line-through font-normal">
              {formattedOriginalPrice}
            </span>
          )}
          <span className={hasSale ? 'font-[600] text-red-600 dark:text-red-500' : 'font-[600] text-black dark:text-white'}>
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
