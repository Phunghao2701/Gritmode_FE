import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import ProductVariantSelector from '../components/ProductVariantSelector';
import Icon from '../../../shared/components/Icon';
import { useCartStore } from '../../../app/store/cartStore';
import { toast } from '../../../shared/utils/toast';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import EmptyState from '../../../shared/components/EmptyState';
import { formatPriceVND } from '../utils/product.utils';

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
    displayImages,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedQuantity,
    selectOptionValue,
    incrementQuantity,
    decrementQuantity,
  } = useProductDetail(slug);

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('details');

  if (isLoadingProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <LoadingSkeleton height="550px" className="rounded-3xl" />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <LoadingSkeleton height="1.5rem" width="30%" />
            <LoadingSkeleton height="2.5rem" width="80%" />
            <LoadingSkeleton height="2rem" width="40%" />
            <LoadingSkeleton height="6rem" />
            <LoadingSkeleton height="3.5rem" />
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
  const currentImage = displayImages[selectedImageIndex] || displayImages[0] || {
    url_product_image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
  };

  const handleAddToCart = (shouldRedirect = false) => {
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

    addItem({
      productId: product.product_id,
      variantId: selectedVariant.product_variant_id,
      title: product.name_product,
      price: selectedVariant.price,
      image: currentImage.url_product_image,
      quantity: selectedQuantity,
    });

    if (shouldRedirect) {
      navigate('/checkout');
    } else {
      toast.success(`Đã thêm ${selectedQuantity}x "${product.name_product}" vào giỏ hàng!`);
      openDrawer();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb (Monochrome) */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
        <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">
          {primaryCategory ? primaryCategory.name_category : 'Sản phẩm'}
        </Link>
        <span>/</span>
        <span className="text-black dark:text-white truncate max-w-xs">{product.name_product}</span>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Product Image Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md flex items-center justify-center">
            <img
              src={currentImage.url_product_image}
              alt={product.name_product}
              className="w-full h-full object-contain object-center"
            />
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest bg-white text-black px-4 py-1.5 rounded-full shadow-lg">
                  Tạm hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {displayImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {displayImages.map((img, idx) => (
                <button
                  key={img.product_image_id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-100 dark:bg-neutral-900 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-black dark:border-white ring-2 ring-black/10'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url_product_image}
                    alt={`${product.name_product} - ${idx}`}
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Options & Purchasing (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {primaryCategory && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-black text-white dark:bg-white dark:text-black">
                {primaryCategory.name_category}
              </span>
            )}

            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white mt-3 leading-tight">
              {product.name_product}
            </h1>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="font-display font-black text-3xl text-black dark:text-white">
                {formatPriceVND(displayPrice)}
              </span>
            </div>

            {/* Availability Indicator */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              {isAvailable ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Icon icon="solar:check-circle-bold" />
                  <span>Còn {availableStock} sản phẩm sẵn sàng giao</span>
                </span>
              ) : (
                <span className="text-neutral-400 font-bold flex items-center gap-1">
                  <Icon icon="solar:close-circle-bold" />
                  <span>Phân loại này hiện đang hết hàng</span>
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Variant Options (Color, Size, etc.) */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <ProductVariantSelector
              options={product.options}
              selectedOptionValues={selectedOptionValues}
              onSelectOptionValue={selectOptionValue}
            />

            {/* Size Guide Trigger */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <Icon icon="solar:ruler-bold" />
                <span>Bảng quy đổi kích cỡ (Size Chart)</span>
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base font-black disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-black text-black dark:text-white">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={incrementQuantity}
                  disabled={!isAvailable || (availableStock > 0 && selectedQuantity >= availableStock)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-base font-black disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!isAvailable}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-300 dark:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
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
              className="w-full py-3.5 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black hover:opacity-85 text-xs font-black uppercase tracking-widest shadow-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              MUA NGAY (GIAO TẬN NƠI)
            </button>
          </div>

          {/* Accordion Sections */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            {[
              { id: 'details', title: 'CHI TIẾT & CHẤT LIỆU', content: product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.' },
              { id: 'shipping', title: 'VẬN CHUYỂN & ĐỔI TRẢ', content: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000₫. Hỗ trợ đổi size miễn phí trong 30 ngày kể từ ngày nhận hàng.' },
              { id: 'care', title: 'HƯỚNG DẪN BẢO QUẢN', content: 'Nên giặt bằng nước lạnh, lộn trái áo khi giặt và phơi để giữ hình in bền lâu. Không sử dụng thuốc tẩy mạnh.' },
            ].map((acc) => (
              <div key={acc.id} className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === acc.id ? '' : acc.id)}
                  className="w-full py-3 px-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-black dark:text-white bg-neutral-50 dark:bg-neutral-900/50 cursor-pointer"
                >
                  <span>{acc.title}</span>
                  <Icon icon={openAccordion === acc.id ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} />
                </button>
                {openAccordion === acc.id && (
                  <div className="p-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-950 whitespace-pre-line">
                    {acc.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-black dark:text-white">
                BẢNG QUY ĐỔI KÍCH CỠ (SIZE CHART)
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
    </div>
  );
}
