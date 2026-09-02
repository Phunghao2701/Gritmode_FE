import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import {
  getAdminCategoriesApi,
  getAdminCollectionsApi,
  getAdminProductByIdApi,
  createCategoryApi,
  updateCategoryApi,
  createAdminFullProductApi,
  updateAdminFullProductApi,
  publishAdminProductApi,
  uploadAdminProductImagesApi,
} from '../apis/admin.api';
import { generateSkuSuggestion } from '../utils/productVariants';
import { toast } from '../../../shared/utils/toast';
import CategoryFormModal from '../components/CategoryFormModal';

const splitValues = (value) => [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
const combinationKey = (color, size) => `${color}\u0000${size}`;

export const formatNumberWithDots = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(digits));
};

export const parsePriceNumber = (val) => {
  if (!val) return 0;
  const num = Number(String(val).replace(/\./g, '').replace(/,/g, '').trim());
  return isNaN(num) ? 0 : num;
};

export const parseSalePriceNumber = (val) => {
  if (!val) return null;
  const num = Number(String(val).replace(/\./g, '').replace(/,/g, '').trim());
  return isNaN(num) || num <= 0 ? null : num;
};

const organizeCategories = (items = []) => {
  const records = new Map();
  const collect = (list, fallbackParentId = null) => {
    for (const item of list || []) {
      const id = String(item.category_id || item.id);
      const explicitParentId = item.parent_category_id ?? item.parent_id;
      records.set(id, {
        ...item,
        __id: id,
        __parentId: explicitParentId != null ? String(explicitParentId) : fallbackParentId,
      });
      collect(item.children || item.subcategories || [], id);
    }
  };
  collect(items);

  const childrenByParent = new Map();
  for (const item of records.values()) {
    const parentKey = item.__parentId && records.has(item.__parentId) ? item.__parentId : '__root__';
    childrenByParent.set(parentKey, [...(childrenByParent.get(parentKey) || []), item]);
  }
  const sortItems = (list) => [...list].sort((a, b) =>
    Number(a.position_category || 0) - Number(b.position_category || 0)
      || String(a.name_category || a.name).localeCompare(String(b.name_category || b.name), 'vi')
  );
  const flatten = (parentKey = '__root__', depth = 0) => sortItems(childrenByParent.get(parentKey) || []).flatMap((item) => {
    const children = childrenByParent.get(item.__id) || [];
    return [{ ...item, __depth: depth, __hasChildren: children.length > 0 }, ...flatten(item.__id, depth + 1)];
  });
  return flatten();
};

const responseItems = (response) => {
  const data = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(data) ? data : data.items || data.collections || data.categories || [];
};

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', '2XL', 'Free'];

export default function AdminProductEditPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(productId);

  const [form, setForm] = useState({ name_product: '', description: '', primary_category_id: '', collection_ids: [] });
  const [colorText, setColorText] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [customSizeText, setCustomSizeText] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultSalePercent, setDefaultSalePercent] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [variants, setVariants] = useState({});
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [productStatus, setProductStatus] = useState('draft');
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Category modal state
  const [categoryModal, setCategoryModal] = useState({ open: false, editing: null, initialParentId: '' });
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const catDropdownRef = useRef(null);

  const colors = useMemo(() => splitValues(colorText), [colorText]);
  const customSizes = useMemo(() => splitValues(customSizeText), [customSizeText]);
  const sizes = useMemo(() => [...new Set([...selectedSizes, ...customSizes])], [selectedSizes, customSizes]);
  const combinations = useMemo(() => colors.flatMap((color) => sizes.map((size) => ({ color, size, key: combinationKey(color, size) }))), [colors, sizes]);

  // Fetch Categories & Collections references
  useEffect(() => {
    let mounted = true;
    const fetchRefs = async () => {
      try {
        const [catsRes, colsRes] = await Promise.all([
          getAdminCategoriesApi(),
          getAdminCollectionsApi(),
        ]);
        if (mounted) {
          setCategories(organizeCategories(responseItems(catsRes)));
          setCollections(responseItems(colsRes));
        }
      } catch {
        if (mounted) setError('Không thể tải danh mục hoặc bộ sưu tập.');
      }
    };
    fetchRefs();
    return () => { mounted = false; };
  }, []);

  // Fetch product detail if in edit mode
  useEffect(() => {
    if (!productId) {
      setLoadingProduct(false);
      return;
    }
    let mounted = true;
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const res = await getAdminProductByIdApi(productId);
        const p = res.data?.data || res.data;
        if (!mounted || !p) return;
        setProductStatus(p.status_product || 'draft');

        const options = Array.isArray(p.options) ? p.options : [];
        const colorOption = options.find((opt) => opt.name_option?.toLowerCase().includes('màu') || opt.name_option?.toLowerCase().includes('color'));
        const sizeOption = options.find((opt) => opt.name_option?.toLowerCase().includes('kích') || opt.name_option?.toLowerCase().includes('size'));

        let initialColors = colorOption ? colorOption.values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean) : [];
        let initialSizes = sizeOption ? sizeOption.values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean) : [];

        if (initialColors.length === 0 && options[0]?.values) {
          initialColors = options[0].values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean);
        }
        if (initialSizes.length === 0 && options[1]?.values) {
          initialSizes = options[1].values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean);
        }

        setColorText(initialColors.join(', '));
        setSelectedSizes(initialSizes.filter((s) => STANDARD_SIZES.includes(s)));
        setCustomSizeText(initialSizes.filter((s) => !STANDARD_SIZES.includes(s)).join(', '));

        const primaryCat = p.categories?.find((c) => c.is_primary) || p.categories?.[0];
        setForm({
          name_product: p.name_product || '',
          description: p.description || '',
          primary_category_id: primaryCat ? String(primaryCat.category_id) : '',
          collection_ids: (p.collections || []).map((c) => String(c.collection_id)),
        });

        // Populate variants map
        const variantMap = {};
        (p.variants || []).forEach((v) => {
          let vColor = '';
          let vSize = '';
          (v.option_values || []).forEach((ov) => {
            const optName = (ov.name_option || ov.option_name || '').toLowerCase();
            const val = String(ov.value_option || ov.value || '').trim();
            if (optName.includes('màu') || optName.includes('color')) vColor = val;
            else if (optName.includes('size') || optName.includes('kích')) vSize = val;
            else if (initialColors.includes(val)) vColor = val;
            else if (initialSizes.includes(val)) vSize = val;
          });

          if (!vColor && v.option_values?.[0]) vColor = String(v.option_values[0].value_option || v.option_values[0].value || '').trim();
          if (!vSize && v.option_values?.[1]) vSize = String(v.option_values[1].value_option || v.option_values[1].value || '').trim();

          if (vColor && vSize) {
            const key = combinationKey(vColor, vSize);
            const priceNum = v.price ? Number(v.price) : 0;
            const salePriceNum = v.sale_price ? Number(v.sale_price) : 0;
            let percent = '';
            if (priceNum > 0 && salePriceNum > 0 && salePriceNum < priceNum) {
              percent = String(Math.round((1 - salePriceNum / priceNum) * 100));
            }
            variantMap[key] = {
              product_variant_id: v.product_variant_id,
              sku: v.sku || '',
              price: v.price ? formatNumberWithDots(v.price) : '',
              sale_percent: percent,
              sale_price: v.sale_price ? formatNumberWithDots(v.sale_price) : '',
              sale_start_at: v.sale_start_at ? v.sale_start_at.slice(0, 16) : '',
              sale_end_at: v.sale_end_at ? v.sale_end_at.slice(0, 16) : '',
              stock: v.inventory?.quantity_stock ?? v.quantity_stock ?? '',
              is_active: v.is_active ?? true,
            };
          }
        });
        setVariants(variantMap);
        const firstVariant = p.variants?.[0];
        if (firstVariant) {
          const price = Number(firstVariant.price || 0);
          const salePrice = Number(firstVariant.sale_price || 0);
          setDefaultStock(firstVariant.inventory?.quantity_stock ?? firstVariant.quantity_stock ?? '');
          setDefaultPrice(price ? formatNumberWithDots(price) : '');
          setDefaultSalePercent(
            price > 0 && salePrice > 0 && salePrice < price
              ? String(Math.round((1 - salePrice / price) * 100))
              : '',
          );
        }

        // Populate images
        setImages((p.images || []).map((img, idx) => ({
          url_product_image: img.url_product_image || img.url,
          is_thumbnail: img.is_thumbnail ?? idx === 0,
          position: img.position_product_image ?? idx,
        })));
      } catch {
        if (mounted) toast.error('Không thể tải thông tin sản phẩm.');
      } finally {
        if (mounted) setLoadingProduct(false);
      }
    };
    fetchProduct();
    return () => { mounted = false; };
  }, [productId]);

  // Sync combinations to variants state
  useEffect(() => {
    setVariants((prev) => {
      const next = { ...prev };
      let hasChange = false;
      combinations.forEach(({ color, size, key }) => {
        if (!next[key]) {
          hasChange = true;
          next[key] = {
            sku: generateSkuSuggestion(form.name_product, [{ value_option: color }, { value_option: size }]),
            stock: 0,
            is_active: true,
          };
        }
      });
      return hasChange ? next : prev;
    });
  }, [combinations, form.name_product]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const res = await uploadAdminProductImagesApi(files);
      const uploaded = res.data?.data || res.data || [];
      setImages((prev) => {
        const next = [...prev, ...uploaded.map((img, i) => ({
          url_product_image: img.url,
          is_thumbnail: prev.length === 0 && i === 0,
          position: prev.length + i,
        }))];
        return next;
      });
      toast.success(`Đã tải lên ${uploaded.length} ảnh!`);
    } catch {
      toast.error('Tải ảnh thất bại.');
    }
  };

  const handleSetThumbnail = (index) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_thumbnail: i === index })));
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length && !next.some((img) => img.is_thumbnail)) next[0].is_thumbnail = true;
      return next;
    });
  };

  const refreshCategories = async () => {
    const catsRes = await getAdminCategoriesApi();
    setCategories(organizeCategories(responseItems(catsRes)));
  };

  const handleCategoryModalSubmit = async (categoryData) => {
    try {
      let catId;
      if (categoryModal.editing) {
        await updateCategoryApi(categoryModal.editing.category_id || categoryModal.editing.__id, categoryData);
        catId = String(categoryModal.editing.category_id || categoryModal.editing.__id);
        toast.success('Đã cập nhật danh mục!');
      } else {
        const res = await createCategoryApi(categoryData);
        const created = res.data?.data || res.data;
        catId = String(created.category_id || created.id);
        toast.success('Đã tạo danh mục mới!');
        setForm((prev) => ({ ...prev, primary_category_id: catId }));
      }
      await refreshCategories();
      setCategoryModal({ open: false, editing: null, initialParentId: '' });
    } catch {
      toast.error('Không thể lưu danh mục');
    }
  };

  const handleSave = async (publishNow = false) => {
    if (!form.name_product.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (!form.primary_category_id) {
      toast.error('Vui lòng chọn danh mục chính.');
      return;
    }
    if (combinations.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 màu sắc và 1 kích thước.');
      return;
    }

    const price = parsePriceNumber(defaultPrice);
    if (price <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ.');
      return;
    }
    const salePercent = Number(defaultSalePercent || 0);
    const salePrice = salePercent > 0 && salePercent < 100
      ? Math.round(price * (100 - salePercent) / 100)
      : null;

    const payloadVariants = combinations.map(({ color, size, key }) => {
      const v = variants[key] || {};
      return {
        ...(v.product_variant_id ? { product_variant_id: v.product_variant_id } : {}),
        sku: v.sku || generateSkuSuggestion(form.name_product, [{ value_option: color }, { value_option: size }]),
        price,
        sale_price: salePrice,
        sale_start_at: v.sale_start_at || null,
        sale_end_at: v.sale_end_at || null,
        quantity_stock: Number(defaultStock) || 0,
        is_active: v.is_active ?? true,
        option_values: {
          'Màu sắc': color,
          'Kích thước': size,
        },
      };
    });

    const payload = {
      name_product: form.name_product.trim(),
      description: form.description || '',
      category_ids: [Number(form.primary_category_id)],
      primary_category_id: Number(form.primary_category_id),
      collection_ids: form.collection_ids.map(Number),
      options: [
        { name_option: 'Màu sắc', values: colors },
        { name_option: 'Kích thước', values: sizes },
      ],
      variants: payloadVariants,
      images: images.map((img, idx) => ({
        url_product_image: img.url_product_image,
        is_thumbnail: Boolean(img.is_thumbnail),
        position_product_image: idx,
      })),
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await updateAdminFullProductApi(productId, payload);
        if (publishNow && productStatus === 'draft') await publishAdminProductApi(productId);
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        const res = await createAdminFullProductApi(payload);
        const created = res.data?.data || res.data;
        const newId = created.product_id || created.id;
        if (publishNow && newId) await publishAdminProductApi(newId);
        toast.success(publishNow ? 'Đăng bán sản phẩm thành công!' : 'Tạo nháp sản phẩm thành công!');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (err) {
      const missing = err.response?.data?.errors?.missing;
      const missingLabels = {
        variants: 'variant',
        valid_variant_inventory: 'tồn kho hợp lệ',
        categories: 'danh mục',
        primary_category: 'danh mục chính',
        images: 'ảnh sản phẩm',
        variant_options: 'option của variant',
      };
      const detail = Array.isArray(missing)
        ? `Thiếu: ${missing.map((item) => missingLabels[item] || item).join(', ')}`
        : null;
      toast.error(detail || err.response?.data?.message || err.message || 'Lỗi khi lưu sản phẩm');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <LoadingSkeleton className="h-10 w-48 rounded-xl" />
        <LoadingSkeleton className="h-64 rounded-3xl" />
        <LoadingSkeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white mb-2 transition-colors"
          >
            <Icon icon="solar:arrow-left-linear" />
            <span>Quay lại danh sách sản phẩm</span>
          </Link>
          <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white">
            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <PrimaryButton
            variant="outline"
            onClick={() => handleSave(false)}
            isLoading={submitting}
          >
            Lưu bản nháp
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleSave(true)}
            isLoading={submitting}
          >
            {productStatus === 'draft' ? 'Đăng bán ngay' : 'Lưu thay đổi'}
          </PrimaryButton>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-200 dark:border-rose-900">
          {error}
        </div>
      )}

      {/* Grid: Left Column (Main details) & Right Column (Categories/Collections/Images) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Info & Variants */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              1. Thông tin cơ bản
            </h2>
            
            <InputField
              label="Tên sản phẩm *"
              placeholder="VD: Áo Thun Oversized Streetwear Gritmode"
              value={form.name_product}
              onChange={(e) => setForm((p) => ({ ...p, name_product: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Mô tả sản phẩm
              </label>
              <textarea
                rows={5}
                placeholder="Mô tả chất liệu 100% cotton, định lượng GSM, form dáng, hướng dẫn giặt sấy..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Options & Variants Builder */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              2. Màu sắc, kích thước & giá bán
            </h2>

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Màu sắc (phân cách bằng dấu phẩy) *
              </label>
              <input
                type="text"
                placeholder="VD: Đen, Trắng, Xám Tiêu, Rêu"
                value={colorText}
                onChange={(e) => setColorText(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Kích thước tiêu chuẩn *
              </label>
              <div className="flex flex-wrap gap-2">
                {STANDARD_SIZES.map((s) => {
                  const isSelected = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSizes((prev) => isSelected ? prev.filter((item) => item !== s) : [...prev, s])}
                      className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                          : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Kích thước tùy chỉnh khác (VD: 3XL, 30, 31, 32...)"
                  value={customSizeText}
                  onChange={(e) => setCustomSizeText(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-2.5 text-xs"
                />
              </div>
            </div>

            {/* Shared pricing */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Giá bán chung
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá bán (VND)"
                  value={formatNumberWithDots(defaultPrice)}
                  onChange={(e) => setDefaultPrice(formatNumberWithDots(e.target.value))}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-bold"
                />
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    placeholder="Sale (%)"
                    value={defaultSalePercent}
                    onChange={(e) => setDefaultSalePercent(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 pr-7 text-xs font-bold text-rose-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold pointer-events-none">%</span>
                </div>
                <input
                  type="number"
                  min="0"
                  placeholder="Số lượng tồn kho"
                  value={defaultStock}
                  onChange={(e) => setDefaultStock(e.target.value)}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Category, Collections & Images */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Categories */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Danh mục chính *</span>
              <button
                type="button"
                onClick={() => setCategoryModal({ open: true, editing: null, initialParentId: '' })}
                className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
              >
                + Thêm mới
              </button>
            </div>

            {/* Collapsible Category Tree Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setCatDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-xs font-bold text-left cursor-pointer focus:outline-none"
              >
                <span className={form.primary_category_id ? 'text-black dark:text-white' : 'text-neutral-400'}>
                  {form.primary_category_id
                    ? (() => {
                        const found = categories.find((c) => c.__id === form.primary_category_id);
                        return found ? (found.name_category || found.name) : '-- Chọn danh mục --';
                      })()
                    : '-- Chọn danh mục --'}
                </span>
                <Icon icon={catDropdownOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} className="text-neutral-400" />
              </button>

              {catDropdownOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                  {(() => {
                    // Build root-level tree from flat organized list
                    const roots = categories.filter((c) => c.__depth === 0);
                    const childrenOf = (parentId) => categories.filter((c) => c.__depth > 0 && c.__parentId === parentId);
                    return roots.map((root) => {
                      const children = childrenOf(root.__id);
                      const isExpanded = expandedCats[root.__id];
                      const isRootSelected = form.primary_category_id === root.__id;
                      return (
                        <div key={root.__id}>
                          {/* Parent row */}
                          <div
                            className={`group flex items-center gap-2 px-4 py-2.5 select-none transition-colors ${
                              isRootSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'text-neutral-400'
                            }`}
                          >
                            {/* Expand toggle */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedCats((prev) => ({ ...prev, [root.__id]: !prev[root.__id] })); }}
                              className={`w-4 h-4 flex items-center justify-center flex-shrink-0 transition-transform ${
                                isRootSelected ? 'text-white dark:text-black' : 'text-neutral-400'
                              } ${children.length === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                              <Icon icon={isExpanded ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} />
                            </button>

                            {/* Name */}
                            <span
                              className="flex-1 text-xs font-bold uppercase tracking-wide truncate"
                            >
                              {root.name_category || root.name}
                            </span>

                            {/* Edit pencil */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setCategoryModal({ open: true, editing: root, initialParentId: '' }); setCatDropdownOpen(false); }}
                              className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                                isRootSelected ? 'hover:bg-white/20' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                              }`}
                              title="Chỉnh sửa"
                            >
                              <Icon icon="solar:pen-linear" className="text-[13px]" />
                            </button>
                          </div>

                          {/* Children rows */}
                          {isExpanded && children.map((child) => {
                            const isChildSelected = form.primary_category_id === child.__id;
                            return (
                              <div
                                key={child.__id}
                                className={`group flex items-center gap-2 pl-10 pr-4 py-2 cursor-pointer select-none transition-colors ${
                                  isChildSelected
                                    ? 'bg-black text-white dark:bg-white dark:text-black'
                                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                <span
                                  className="flex-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 truncate"
                                  style={isChildSelected ? { color: 'inherit' } : {}}
                                  onClick={() => { setForm((p) => ({ ...p, primary_category_id: child.__id })); setCatDropdownOpen(false); }}
                                >
                                  ↳ {child.name_category || child.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setCategoryModal({ open: true, editing: child, initialParentId: child.__parentId || '' }); setCatDropdownOpen(false); }}
                                  className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg ${
                                    isChildSelected ? 'hover:bg-white/20' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                  }`}
                                  title="Chỉnh sửa"
                                >
                                  <Icon icon="solar:pen-linear" className="text-[13px]" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          {categoryModal.open && (
            <CategoryFormModal
              category={categoryModal.editing}
              categories={categories}
              initialParentId={categoryModal.initialParentId}
              onClose={() => setCategoryModal({ open: false, editing: null, initialParentId: '' })}
              onSubmitCategory={handleCategoryModalSubmit}
            />
          )}

          {/* Collections */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
              Bộ sưu tập (Collections)
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {collections.filter((col) => col.parent_collection_id).map((col) => {
                const colId = String(col.collection_id || col.id);
                const isSelected = form.collection_ids.includes(colId);
                return (
                  <label key={colId} className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        setForm((prev) => ({
                          ...prev,
                          collection_ids: e.target.checked
                            ? [...prev.collection_ids, colId]
                            : prev.collection_ids.filter((id) => id !== colId),
                        }));
                      }}
                      className="rounded border-neutral-300 w-4 h-4 cursor-pointer"
                    />
                    <span>{col.name_collection || col.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Images Upload & Gallery */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Hình ảnh sản phẩm ({images.length})
              </span>
            </div>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-6 text-center hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer bg-neutral-50 dark:bg-neutral-950">
              <Icon icon="solar:cloud-upload-linear" className="text-3xl text-neutral-400 mb-2" />
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                Bấm để chọn hoặc kéo thả ảnh vào đây
              </span>
              <span className="text-[10px] text-neutral-400 mt-1">JPEG, PNG, WebP (Tối đa 10MB)</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden border aspect-square group ${
                      img.is_thumbnail ? 'ring-2 ring-black dark:ring-white border-transparent' : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <img src={img.url_product_image} alt={`img-${i}`} className="w-full h-full object-cover" />
                    
                    {img.is_thumbnail && (
                      <span className="absolute top-2 left-2 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow">
                        Thumbnail
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                      {!img.is_thumbnail && (
                        <button
                          type="button"
                          onClick={() => handleSetThumbnail(i)}
                          title="Đặt làm ảnh đại diện"
                          className="p-1.5 bg-white text-black rounded-full hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Icon icon="solar:star-bold" className="text-xs" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        title="Xóa ảnh"
                        className="p-1.5 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" className="text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Floating Save Footer on mobile/desktop */}
      <div className="sticky bottom-4 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-between gap-4">
        <Link
          to="/admin/products"
          className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white"
        >
          Hủy bỏ
        </Link>
        <div className="flex items-center gap-3">
          <PrimaryButton
            variant="outline"
            onClick={() => handleSave(false)}
            isLoading={submitting}
          >
            Lưu bản nháp
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleSave(productStatus === 'draft')}
            isLoading={submitting}
          >
            {productStatus === 'draft' ? 'Đăng bán ngay' : 'Lưu thay đổi'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
