import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';
import { useAdminCategories } from '../hooks/useAdmin';
import {
  createAdminProductApi,
  createProductOptionApi,
  createOptionValueApi,
  createProductVariantApi,
  createProductImageApi,
  assignProductCategoryApi,
  updateVariantInventoryApi,
} from '../apis/admin.api';
import { toast } from '../../../shared/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductFormModal({ product, onClose, onSubmitProduct, isLoading = false }) {
  const queryClient = useQueryClient();
  const { categories } = useAdminCategories();
  
  // Multi-step wizard: 1 (Info), 2 (Options & Variants), 3 (Images & Categories)
  const [step, setStep] = useState(1);
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);

  // Step 1: Base Info
  const [baseInfo, setBaseInfo] = useState({
    name_product: product?.name_product || product?.title || '',
    description: product?.description || '',
    category_id: '',
  });

  // Step 2: Options (e.g. Color, Size)
  const [colorValues, setColorValues] = useState('Black, White');
  const [sizeValues, setSizeValues] = useState('M, L, XL');
  const [basePrice, setBasePrice] = useState('450000');
  const [baseStock, setBaseStock] = useState('20');
  const [skuPrefix, setSkuPrefix] = useState('GM-TEE');

  // Step 3: Images
  const [imageUrl1, setImageUrl1] = useState('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800');
  const [imageUrl2, setImageUrl2] = useState('https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800');

  const isEditMode = !!product;

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!baseInfo.name_product.trim()) return;
    onSubmitProduct({
      name_product: baseInfo.name_product.trim(),
      description: baseInfo.description.trim(),
    });
  };

  const handleFullCreationWorkflow = async () => {
    if (!baseInfo.name_product.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm!');
      setStep(1);
      return;
    }

    try {
      setIsSubmittingWorkflow(true);

      // Bước 1: Tạo Base Product
      const productRes = await createAdminProductApi({
        name_product: baseInfo.name_product.trim(),
        description: baseInfo.description.trim(),
      });
      const createdProduct = productRes.data?.data || productRes.data;
      const productId = createdProduct.product_id || createdProduct.id;

      // Bước 2 & 3: Tạo Options & Option Values
      const colors = colorValues.split(',').map((s) => s.trim()).filter(Boolean);
      const sizes = sizeValues.split(',').map((s) => s.trim()).filter(Boolean);

      let colorOptionId = null;
      const colorValueMap = {}; // name -> id
      if (colors.length > 0) {
        const optRes = await createProductOptionApi(productId, { name_option: 'Color' });
        const optData = optRes.data?.data || optRes.data;
        colorOptionId = optData.product_option_id || optData.option_id;

        for (const c of colors) {
          const valRes = await createOptionValueApi(colorOptionId, { value_option: c });
          const valData = valRes.data?.data || valRes.data;
          colorValueMap[c] = valData.product_option_value_id || valData.value_id;
        }
      }

      let sizeOptionId = null;
      const sizeValueMap = {}; // name -> id
      if (sizes.length > 0) {
        const optRes = await createProductOptionApi(productId, { name_option: 'Size' });
        const optData = optRes.data?.data || optRes.data;
        sizeOptionId = optData.product_option_id || optData.option_id;

        for (const s of sizes) {
          const valRes = await createOptionValueApi(sizeOptionId, { value_option: s });
          const valData = valRes.data?.data || valRes.data;
          sizeValueMap[s] = valData.product_option_value_id || valData.value_id;
        }
      }

      // Bước 4 & 5: Tạo Ma trận Biến thể (Variants) & Cập nhật Tồn kho (Inventory)
      const priceNum = Number(basePrice) || 350000;
      const stockNum = Number(baseStock) || 10;

      for (const c of colors.length > 0 ? colors : ['Standard']) {
        for (const s of sizes.length > 0 ? sizes : ['Free']) {
          const optionValueIds = [];
          if (colorValueMap[c]) optionValueIds.push(colorValueMap[c]);
          if (sizeValueMap[s]) optionValueIds.push(sizeValueMap[s]);

          const sku = `${skuPrefix}-${c.slice(0, 3).toUpperCase()}-${s.toUpperCase()}`;
          const varRes = await createProductVariantApi(productId, {
            sku,
            price: priceNum,
            option_value_ids: optionValueIds,
          });
          const varData = varRes.data?.data || varRes.data;
          const variantId = varData.product_variant_id || varData.variant_id;

          if (variantId && stockNum > 0) {
            try {
              await updateVariantInventoryApi(variantId, stockNum);
            } catch (err) {
              console.warn('Could not set initial inventory for variant:', variantId, err);
            }
          }
        }
      }

      // Bước 6: Thêm Hình ảnh
      if (imageUrl1.trim()) {
        await createProductImageApi(productId, {
          url_product_image: imageUrl1.trim(),
          position_product_image: 1,
        });
      }
      if (imageUrl2.trim()) {
        await createProductImageApi(productId, {
          url_product_image: imageUrl2.trim(),
          position_product_image: 2,
        });
      }

      // Bước 7: Gán Danh mục
      if (baseInfo.category_id) {
        try {
          await assignProductCategoryApi(productId, {
            category_id: Number(baseInfo.category_id),
            is_primary: true,
          });
        } catch (err) {
          console.warn('Could not assign category:', err);
        }
      }

      toast.success('Tạo sản phẩm và toàn bộ biến thể thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      onClose();
    } catch (err) {
      console.error('Failed to create full product workflow:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình tạo sản phẩm');
    } finally {
      setIsSubmittingWorkflow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {isEditMode ? 'Catalog Management' : 'Product Creation Wizard'}
            </span>
            <h3 className="font-display font-black text-xl text-black dark:text-white uppercase tracking-tight">
              {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white text-xl cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" />
          </button>
        </div>

        {/* Wizard Steps Indicator (Only when creating new product) */}
        {!isEditMode && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { stepNum: 1, title: '1. Thông tin chung' },
              { stepNum: 2, title: '2. Thuộc tính & Giá' },
              { stepNum: 3, title: '3. Ảnh & Danh mục' },
            ].map((st) => (
              <button
                key={st.stepNum}
                type="button"
                onClick={() => setStep(st.stepNum)}
                className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                  step === st.stepNum
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {st.title}
              </button>
            ))}
          </div>
        )}

        {/* Wizard Content */}
        {isEditMode ? (
          /* Simple Edit Form */
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <InputField
              label="Tên sản phẩm *"
              placeholder="VD: Áo Thun Gritmode Oversized Signature"
              value={baseInfo.name_product}
              onChange={(e) => setBaseInfo({ ...baseInfo, name_product: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-neutral-500 block">
                Mô tả chi tiết sản phẩm
              </label>
              <textarea
                rows={4}
                placeholder="Chất liệu 100% Cotton 280GSM, form dáng Boxy Fit..."
                value={baseInfo.description}
                onChange={(e) => setBaseInfo({ ...baseInfo, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-black dark:hover:border-white transition-all cursor-pointer"
              >
                Hủy
              </button>
              <PrimaryButton type="submit" isLoading={isLoading} size="sm">
                Lưu cập nhật
              </PrimaryButton>
            </div>
          </form>
        ) : (
          /* 3-Step Wizard for Complete Creation */
          <div className="space-y-4 text-xs">
            {step === 1 && (
              <div className="space-y-4">
                <InputField
                  label="Tên sản phẩm *"
                  placeholder="VD: Áo Thun Gritmode Boxy Signature"
                  value={baseInfo.name_product}
                  onChange={(e) => setBaseInfo({ ...baseInfo, name_product: e.target.value })}
                  required
                />

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-neutral-500 block">
                    Mô tả chi tiết sản phẩm
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Chất liệu 100% Cotton định lượng 280GSM, form Boxy Streetwear..."
                    value={baseInfo.description}
                    onChange={(e) => setBaseInfo({ ...baseInfo, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-medium focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-neutral-500 block">
                    Danh mục sản phẩm
                  </label>
                  <select
                    value={baseInfo.category_id}
                    onChange={(e) => setBaseInfo({ ...baseInfo, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 text-black dark:text-white font-bold focus:outline-none"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {(categories || []).map((c) => (
                      <option key={c.category_id || c.id} value={c.category_id || c.id}>
                        {c.name_category || c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Khai báo thuộc tính (Options)
                  </span>

                  <InputField
                    label="Màu sắc (phân tách bằng dấu phẩy)"
                    placeholder="Black, White, Charcoal"
                    value={colorValues}
                    onChange={(e) => setColorValues(e.target.value)}
                  />

                  <InputField
                    label="Kích cỡ (phân tách bằng dấu phẩy)"
                    placeholder="M, L, XL"
                    value={sizeValues}
                    onChange={(e) => setSizeValues(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InputField
                    label="Mã SKU Prefix"
                    placeholder="VD: GM-TEE"
                    value={skuPrefix}
                    onChange={(e) => setSkuPrefix(e.target.value)}
                  />

                  <InputField
                    label="Giá bán (VND)"
                    type="number"
                    placeholder="450000"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />

                  <InputField
                    label="Tồn kho mỗi biến thể"
                    type="number"
                    placeholder="20"
                    value={baseStock}
                    onChange={(e) => setBaseStock(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    Hình ảnh sản phẩm (Image URLs)
                  </span>

                  <InputField
                    label="Ảnh đại diện (Mặt trước)"
                    placeholder="https://..."
                    value={imageUrl1}
                    onChange={(e) => setImageUrl1(e.target.value)}
                  />

                  <InputField
                    label="Ảnh chi tiết (Mặt sau / Lookbook)"
                    placeholder="https://..."
                    value={imageUrl2}
                    onChange={(e) => setImageUrl2(e.target.value)}
                  />
                </div>

                <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <p className="font-bold text-black dark:text-white">Tóm tắt quy trình tạo tự động:</p>
                  <p className="text-neutral-500 text-[11px]">
                    Hệ thống sẽ tự động tạo Product #{baseInfo.name_product || '...'} ➔ Tạo Options Color & Size ➔ Sinh ma trận Biến thể ({colorValues.split(',').length * sizeValues.split(',').length} biến thể) ➔ Gán tồn kho {baseStock} cái/biến thể ➔ Lưu ảnh Gallery.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-black dark:hover:border-white transition-all cursor-pointer"
                >
                  Quay lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold hover:border-black dark:hover:border-white transition-all cursor-pointer"
                >
                  Đóng
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!baseInfo.name_product.trim()) {
                      toast.error('Vui lòng nhập tên sản phẩm trước khi tiếp tục');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-wider text-xs hover:opacity-85 transition-all cursor-pointer shadow-md"
                >
                  Tiếp tục
                </button>
              ) : (
                <PrimaryButton
                  type="button"
                  onClick={handleFullCreationWorkflow}
                  isLoading={isSubmittingWorkflow}
                  size="sm"
                >
                  Khởi tạo sản phẩm hoàn chỉnh
                </PrimaryButton>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
