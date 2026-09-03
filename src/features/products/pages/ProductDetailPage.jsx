import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import ProductVariantSelector from '../components/ProductVariantSelector';
import Icon from '../../../shared/components/Icon';
import { useCartStore } from '../../../app/store/cartStore';
import { toast } from '../../../shared/utils/toast';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import { formatPriceVND, getProductImageSrcSet, getSizedProductImageUrl } from '../utils/product.utils';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCartStore();

  const {
    product,
    isLoadingProduct,
    isError,
    selectedOptionValues,
    selectedVariant,
    isAllOptionsSelected,
    isAvailable,
    availableStock,
    displayPrice,
    originalPrice,
    hasSale,
    displayImages,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedQuantity,
    selectOptionValue,
    incrementQuantity,
    decrementQuantity,
  } = useProductDetail(slug);

  const primaryCategoryId = product?.categories?.find((c) => c.is_primary)?.category_id || product?.categories?.[0]?.category_id;
  const { products: allProducts = [] } = useProducts(
    primaryCategoryId ? { category_id: primaryCategoryId, limit: 20, sort: 'newest' } : { limit: 20, sort: 'newest' }
  );

  const relatedSliderRef = useRef(null);
  const handleScrollLeft = () => {
    if (relatedSliderRef.current) {
      relatedSliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  const handleScrollRight = () => {
    if (relatedSliderRef.current) {
      relatedSliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('details');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isPanningImage, setIsPanningImage] = useState(false);
  const imagePanStartRef = useRef(null);
  const imagePanMovedRef = useRef(false);

  // Touch swipe gesture support for mobile / touch devices
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const minSwipeDistance = 40;

  const galleryImages = (displayImages && displayImages.length > 0) ? displayImages : (product?.images || []);
  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0] || null;

  const handlePrevImage = useCallback(() => {
    if (isZoomed || galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  }, [galleryImages.length, isZoomed, setSelectedImageIndex]);

  const handleNextImage = useCallback(() => {
    if (isZoomed || galleryImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  }, [galleryImages.length, isZoomed, setSelectedImageIndex]);

  const handleImagePanStart = (e) => {
    if (!isZoomed) return;
    imagePanStartRef.current = { x: e.clientX, y: e.clientY };
    imagePanMovedRef.current = false;
    setIsPanningImage(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleImagePanMove = (e) => {
    if (!imagePanStartRef.current) return;
    const x = e.clientX - imagePanStartRef.current.x;
    const y = e.clientY - imagePanStartRef.current.y;
    if (Math.abs(x) + Math.abs(y) > 4) imagePanMovedRef.current = true;
    setImagePan({ x, y });
  };

  const handleImagePanEnd = () => {
    imagePanStartRef.current = null;
    setIsPanningImage(false);
    setImagePan({ x: 0, y: 0 });
  };

  // Keyboard navigation & zoom reset for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) {
      setIsZoomed(false);
      return;
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNextImage, handlePrevImage]);

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNextImage();
    } else if (distance < -minSwipeDistance) {
      handlePrevImage();
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="aspect-[3/4] w-full rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <LoadingSkeleton height="1.5rem" width="30%" className="rounded-lg" />
            <LoadingSkeleton height="2.5rem" width="80%" className="rounded-lg" />
            <LoadingSkeleton height="2rem" width="40%" className="rounded-lg" />
            <LoadingSkeleton height="6rem" className="rounded-2xl" />
            <LoadingSkeleton height="3.5rem" className="rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh."
          icon="solar:box-minimalistic-linear"
          actionLabel="Khám phá bộ sưu tập"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const primaryCategory = product.categories?.find((c) => c.is_primary) || product.categories?.[0];
  const currentProductId = product?.product_id || product?.id;
  const relatedProducts = (allProducts || [])
    .filter((p) => String(p.product_id || p.id) !== String(currentProductId))
    .slice(0, 4);

  const handleAddToCart = async (shouldRedirect = false) => {
    if (!isAllOptionsSelected) {
      toast.error('Vui lòng chọn đầy đủ các phân loại sản phẩm.');
      return;
    }

    if (!selectedVariant) {
      toast.error('Tổ hợp phân loại này hiện không khả dụng.');
      return;
    }

    if (!isAvailable) {
      toast.error('Phân loại sản phẩm này tạm thời đã hết hàng.');
      return;
    }

    const res = await addItem({
      productId: product.product_id,
      variantId: selectedVariant.product_variant_id,
      product_variant_id: selectedVariant.product_variant_id,
      title: product.name_product,
      price: selectedVariant.price,
      image: currentImage?.url_product_image || '',
      quantity: selectedQuantity,
    });

    if (!res?.success) return;

    if (shouldRedirect) {
      navigate('/checkout');
    } else {
      openDrawer();
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fade-in">

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 select-none">
        <Link to="/" className="font-normal hover:text-black dark:hover:text-white transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="font-normal hover:text-black dark:hover:text-white transition-colors">
          {primaryCategory ? primaryCategory.name_category : 'Sản phẩm'}
        </Link>
        <span>/</span>
        <span className="text-black dark:text-white font-[550] truncate max-w-xs">{product.name_product}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

        {/* Left: Product Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => currentImage?.url_product_image && setIsLightboxOpen(true)}
            className="group relative aspect-square w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm flex items-center justify-center select-none cursor-pointer"
          >
            {currentImage?.url_product_image ? (
              <img
                src={getSizedProductImageUrl(currentImage.url_product_image, 960)}
                srcSet={getProductImageSrcSet(currentImage.url_product_image, [640, 960, 1280, 1600])}
                sizes="(min-width: 1024px) 58vw, 100vw"
                alt={product.name_product}
                decoding="async"
                className="w-full h-full object-cover object-center transition-all duration-300 pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 gap-2">
                <Icon icon="solar:t-shirt-bold-duotone" className="text-7xl opacity-40" />
                <span className="text-xs uppercase tracking-widest font-black text-neutral-400">Gritmode Signature</span>
              </div>
            )}

            {/* Next & Previous Navigation Arrows (Hover to show subtly) */}
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-neutral-700 dark:text-neutral-300 hover:!text-black dark:hover:!text-white hover:scale-125 active:scale-90 transition-all cursor-pointer z-10 opacity-0 group-hover:opacity-60 drop-shadow-md"
                  aria-label="Ảnh trước"
                >
                  <Icon icon="solar:alt-arrow-left-linear" className="text-3xl sm:text-4xl" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-700 dark:text-neutral-300 hover:!text-black dark:hover:!text-white hover:scale-125 active:scale-90 transition-all cursor-pointer z-10 opacity-0 group-hover:opacity-60 drop-shadow-md"
                  aria-label="Ảnh tiếp theo"
                >
                  <Icon icon="solar:alt-arrow-right-linear" className="text-3xl sm:text-4xl" />
                </button>
              </>
            )}

            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
                <span className="text-xs font-black uppercase tracking-widest bg-white text-black px-5 py-2 rounded-full shadow-2xl">
                  Tạm hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={img.product_image_id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden transition-all shrink-0 bg-neutral-100 dark:bg-neutral-900 cursor-pointer ${selectedImageIndex === idx
                      ? 'opacity-100 scale-105 shadow-sm'
                      : 'opacity-40 hover:opacity-80'
                    }`}
                >
                  <img
                    src={getSizedProductImageUrl(img.url_product_image, 160)}
                    alt={`${product.name_product} - ${idx}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Options & Purchasing (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h1 className="font-sans font-normal text-2xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-black dark:text-white leading-tight">
              {product.name_product}
            </h1>

            {/* Price Display */}
            <div className="flex flex-wrap items-baseline gap-3 mt-4">
              {hasSale && (
                <span className="font-sans text-lg text-neutral-400 line-through">
                  {formatPriceVND(originalPrice)}
                </span>
              )}
              <span className={hasSale ? 'font-sans font-[550] text-3xl text-rose-600 dark:text-rose-400' : 'font-sans font-[550] text-3xl text-black dark:text-white'}>
                {formatPriceVND(displayPrice)}
              </span>
              {hasSale && (
                <span className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-normal uppercase tracking-wider text-white">
                  Sale
                </span>
              )}
            </div>

            {/* Availability Indicator */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              {isAvailable ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-normal uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Còn {availableStock} sản phẩm trong kho</span>
                </span>
              ) : (
                <span className="text-rose-500 font-normal uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Phân loại này hiện đang tạm hết hàng</span>
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Variant Options (Color, Size, etc.) */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
            <ProductVariantSelector
              options={product.options}
              selectedOptionValues={selectedOptionValues}
              onSelectOptionValue={selectOptionValue}
            />

            {/* Size Guide Trigger */}
            <div>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs font-normal uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white underline flex items-center gap-1.5 cursor-pointer"
              >
                <Icon icon="solar:ruler-bold" />
                <span>Bảng quy đổi kích cỡ</span>
              </button>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-2xl bg-white dark:bg-neutral-900 p-1">
                <button
                  type="button"
                  onClick={decrementQuantity}
                  disabled={selectedQuantity <= 1 || !isAvailable}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base font-[550] disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-[550] text-black dark:text-white">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={!isAvailable || (availableStock > 0 && selectedQuantity >= availableStock)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base font-[550] disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!isAvailable}
                className="flex-1 py-4 px-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-[550] uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <Icon icon="solar:bag-plus-bold" className="text-base" />
                <span>THÊM VÀO GIỎ</span>
              </button>
            </div>

            {/* Buy Now */}
            <button
              type="button"
              onClick={() => handleAddToCart(true)}
              disabled={!isAvailable}
              className="w-full py-4 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-[550] uppercase tracking-widest shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              MUA NGAY
            </button>
          </div>

          {/* Accordion Sections */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            {[
              { id: 'details', title: 'CHI TIẾT & CHẤT LIỆU', content: product.description || 'Chất liệu 100% Premium Heavyweight Cotton 280GSM thoáng mát, form dáng Boxy Streetwear thời thượng.' },
              { id: 'shipping', title: 'VẬN CHUYỂN & ĐỔI TRẢ', content: 'Miễn phí vận chuyển 0đ toàn quốc cho mọi đơn hàng. Hỗ trợ đổi trả size và mẫu miễn phí trong 7 ngày kể từ ngày nhận hàng.' },
              { id: 'care', title: 'HƯỚNG DẪN BẢO QUẢN', content: 'Nên giặt bằng nước lạnh, lộn trái áo khi giặt và phơi để giữ hình in bền lâu. Không sử dụng thuốc tẩy mạnh.' },
            ].map((acc) => (
              <div key={acc.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === acc.id ? '' : acc.id)}
                  className="w-full py-3.5 px-4 flex items-center justify-between text-xs font-[550] uppercase tracking-wider text-black dark:text-white bg-neutral-50 dark:bg-neutral-900/50 cursor-pointer"
                >
                  <span>{acc.title}</span>
                  <Icon icon={openAccordion === acc.id ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} />
                </button>
                {openAccordion === acc.id && (
                  <div className="p-4 text-xs font-normal uppercase tracking-wider text-neutral-600 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-950 whitespace-pre-line">
                    {acc.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products: Có thể bạn sẽ thích (5 items per row with navigation arrows) */}
      {relatedProducts.length > 0 && (
        <div className="pt-16 sm:pt-20 border-t border-neutral-100 dark:border-neutral-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-normal text-xl sm:text-2xl text-black dark:text-white">
              Có thể bạn sẽ thích
            </h2>

            {/* Slider Navigation Arrows */}
            {relatedProducts.length > 3 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-sm active:scale-90"
                  aria-label="Xem sản phẩm trước"
                >
                  <Icon icon="solar:arrow-left-linear" className="text-base" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  className="w-9 h-9 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all cursor-pointer shadow-sm active:scale-90"
                  aria-label="Xem sản phẩm tiếp theo"
                >
                  <Icon icon="solar:arrow-right-linear" className="text-base" />
                </button>
              </div>
            )}
          </div>

          <div
            ref={relatedSliderRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth scrollbar-none pb-4 pt-1 snap-x select-none"
          >
            {relatedProducts.map((relProduct) => (
              <div
                key={relProduct.product_id || relProduct.id}
                className="w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] md:w-[calc(25%-18px)] lg:w-[calc(20%-19.2px)] shrink-0 snap-start"
              >
                <ProductCard product={relProduct} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-sans font-[550] text-xl uppercase tracking-wider text-black dark:text-white">
                BẢNG QUY ĐỔI KÍCH CỠ
              </h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-2xl text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <Icon icon="solar:close-circle-linear" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white uppercase font-black">
                  <tr>
                    <th className="p-3">Size</th>
                    <th className="p-3">Chiều cao</th>
                    <th className="p-3">Cân nặng</th>
                    <th className="p-3">Form dáng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  <tr><td className="p-3 font-black">S</td><td className="p-3">1m50 - 1m65</td><td className="p-3">45kg - 55kg</td><td className="p-3">Fit vừa vặn</td></tr>
                  <tr><td className="p-3 font-black">M</td><td className="p-3">1m65 - 1m75</td><td className="p-3">55kg - 68kg</td><td className="p-3">Oversize nhẹ</td></tr>
                  <tr><td className="p-3 font-black">L</td><td className="p-3">1m75 - 1m82</td><td className="p-3">68kg - 80kg</td><td className="p-3">Oversize chuẩn</td></tr>
                  <tr><td className="p-3 font-black">XL</td><td className="p-3">1m80 - 1m90</td><td className="p-3">80kg - 95kg</td><td className="p-3">Boxy fit rộng</td></tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-neutral-500 italic">
              * Nếu bạn phân vân giữa 2 size, chúng tôi khuyên bạn nên chọn size lớn hơn để có form mặc thoải mái theo phong cách streetwear.
            </p>
          </div>
        </div>
      )}

      {/* High-Resolution DirtyCoins Style Image Lightbox Modal */}
      {isLightboxOpen && currentImage?.url_product_image && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fade-in select-none cursor-pointer"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* 1. Top Control Bar */}
          <div
            className="w-full grid grid-cols-3 items-center z-30 select-none cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Left: Prev / Next buttons */}
            <div className="justify-self-start flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-lg">
              <button
                type="button"
                disabled={isZoomed}
                onClick={handlePrevImage}
                className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                title="Ảnh trước (Mũi tên trái)"
              >
                <Icon icon="solar:arrow-left-linear" className="text-xl" />
              </button>
              <button
                type="button"
                disabled={isZoomed}
                onClick={handleNextImage}
                className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
                title="Ảnh tiếp theo (Mũi tên phải)"
              >
                <Icon icon="solar:arrow-right-linear" className="text-xl" />
              </button>
            </div>

            {/* Top Center: Zoom & Fullscreen Tools */}
            <div className="justify-self-center flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-1 shadow-lg">
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className={`p-2 rounded-lg transition-all cursor-pointer ${isZoomed ? 'bg-white text-black' : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                title={isZoomed ? "Thu nhỏ" : "Phóng to"}
              >
                <Icon icon={isZoomed ? "solar:magnifer-zoom-out-linear" : "solar:magnifer-zoom-in-linear"} className="text-xl" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                  } else {
                    document.exitFullscreen?.();
                  }
                }}
                className="p-2 text-white/75 hover:text-white hover:bg-white/10 rounded-lg transition-all cursor-pointer"
                title="Toàn màn hình"
              >
                <Icon icon="solar:full-screen-linear" className="text-xl" />
              </button>
            </div>

          </div>

          {/* 2. Center Image Canvas */}
          <div className="flex-1 w-full flex items-center justify-center py-2 overflow-hidden cursor-pointer">
            <div
              onPointerDown={handleImagePanStart}
              onPointerMove={handleImagePanMove}
              onPointerUp={handleImagePanEnd}
              onPointerCancel={handleImagePanEnd}
              onClick={(e) => {
                e.stopPropagation();
                if (imagePanMovedRef.current) {
                  imagePanMovedRef.current = false;
                  return;
                }
                setImagePan({ x: 0, y: 0 });
                setIsZoomed((prev) => !prev);
              }}
              onWheel={(e) => {
                setImagePan({ x: 0, y: 0 });
                setIsZoomed(e.deltaY < 0);
              }}
              className={`h-[calc(100vh-140px)] max-w-[95vw] transition-all duration-300 flex items-center justify-center select-none overflow-hidden ${isZoomed ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-zoom-in'}`}
            >
              <img
                key={selectedImageIndex}
                src={getSizedProductImageUrl(currentImage.url_product_image, 1600)}
                alt={product.name_product}
                draggable="false"
                decoding="async"
                style={{ transform: `translate3d(${imagePan.x}px, ${imagePan.y}px, 0) scale(${isZoomed ? 1.5 : 1})` }}
                className={`w-auto max-w-full h-full object-contain ${isPanningImage ? '' : 'transition-transform duration-300'} ${isZoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
              />
            </div>
          </div>

          {/* 3. Bottom Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div
              className="flex justify-center z-30 pb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 max-w-[90vw] overflow-x-auto p-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl scrollbar-none">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.product_image_id || idx}
                    type="button"
                    disabled={isZoomed}
                    onClick={() => {
                      if (isZoomed) return;
                      setSelectedImageIndex(idx);
                    }}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer ${selectedImageIndex === idx
                        ? 'border-white opacity-100 scale-105 shadow-md'
                        : 'border-transparent opacity-40 hover:opacity-80'
                      }`}
                  >
                    <img
                      src={getSizedProductImageUrl(img.url_product_image, 160)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
