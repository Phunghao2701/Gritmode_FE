'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import {
  getAdminCategoriesApi,
  getAdminCollectionsApi,
  getAdminProductMetaApi,
  getAdminProductByIdApi,
  createCategoryApi,
  updateCategoryApi,
  createAdminFullProductApi,
  updateAdminProductApi,
  updateAdminFullProductApi,
  uploadAdminProductImagesApi,
} from '../apis/admin.api';
import { generateSkuSuggestion } from '../utils/productVariants';
import CategoryFormModal from '../components/CategoryFormModal';
import QuickCollectionFormModal from '../components/QuickCollectionFormModal';
import { toast } from '../../../shared/utils/toast';
import { createCollectionApi } from '../../collections/apis/collection.api';
import { unwrapApiData, requireApiArray, requireApiObject } from '../../../shared/services/responseContract';
import { broadcastQueryInvalidation } from '../../../shared/services/queryClient';

const splitValues = (value) => [...new Set(value.split(',').map((item) => item.trim().toUpperCase()).filter(Boolean))];
const combinationKey = (color, size) => `${color}\u0000${size}`;
const optionValueKey = (optionName, value) => `${String(optionName || '').trim().toLowerCase()}\u0000${String(value || '').trim().toLowerCase()}`;

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
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.collections)) return data.collections;
  if (data && Array.isArray(data.categories)) return data.categories;
  throw new Error('Danh sách quản trị không hợp lệ');
};

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', '2XL', 'Free'];

const buildProductStructureSignature = ({
  form,
  colorText,
  sizes,
  hiddenOptionValues,
  defaultPrice,
  defaultSalePercent,
  defaultStock,
  variants,
  images,
}) => JSON.stringify({
  primary_category_id: String(form.primary_category_id || ''),
  collection_ids: [...(form.collection_ids || [])].map(String).sort(),
  colors: splitValues(colorText),
  sizes: [...sizes].map(String).sort(),
  hidden_option_values: Object.entries(hiddenOptionValues || {})
    .filter(([, isHidden]) => Boolean(isHidden))
    .sort(([a], [b]) => a.localeCompare(b)),
  default_price: parsePriceNumber(defaultPrice),
  default_sale_percent: String(defaultSalePercent || ''),
  default_stock: String(defaultStock ?? ''),
  variants: Object.entries(variants || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, variant = {}]) => [key, {
      product_variant_id: variant.product_variant_id || null,
      sku: variant.sku || '',
      price: variant.price || '',
      sale_percent: variant.sale_percent || '',
      sale_price: variant.sale_price || '',
      sale_start_at: variant.sale_start_at || '',
      sale_end_at: variant.sale_end_at || '',
      stock: String(variant.stock ?? ''),
      is_active: variant.is_active ?? true,
    }]),
  images: (images || []).map((image) => ({
    product_image_id: image.product_image_id || null,
    url_product_image: image.url_product_image || '',
    is_thumbnail: Boolean(image.is_thumbnail),
    position: Number(image.position || 0),
  })),
});

export default function AdminProductEditPage() {
  const { id: productId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(productId);

  const [form, setForm] = useState({ name_product: '', description: '', primary_category_id: '', collection_ids: [] });
  const [colorText, setColorText] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCustomSizes, setSelectedCustomSizes] = useState([]);
  const [customSizeDraft, setCustomSizeDraft] = useState('');
  const [isAddingCustomSize, setIsAddingCustomSize] = useState(false);
  const [hiddenOptionValues, setHiddenOptionValues] = useState({});
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultSalePercent, setDefaultSalePercent] = useState('');
  const [defaultStock, setDefaultStock] = useState('');
  const [variants, setVariants] = useState({});
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [productStatus, setProductStatus] = useState('draft');
  const [loadingProduct, setLoadingProduct] = useState(isEditMode);
  const [submittingAction, setSubmittingAction] = useState(null); // 'draft' | 'publish' | null
  const initialStructureSignatureRef = useRef(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const variantsSectionRef = useRef(null);
  const categorySectionRef = useRef(null);
  const imagesSectionRef = useRef(null);
  const nameFieldRef = useRef(null);
  const priceFieldRef = useRef(null);
  const inventoryFieldRef = useRef(null);
  const imageFieldRef = useRef(null);
  const fieldRefs = {
    name: nameFieldRef,
    category: categorySectionRef,
    variants: variantsSectionRef,
    price: priceFieldRef,
    inventory: inventoryFieldRef,
    images: imageFieldRef,
  };

  // Category modal state
  const [categoryModal, setCategoryModal] = useState({ open: false, editing: null, initialParentId: '' });
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState({});
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState({});
  const catDropdownRef = useRef(null);

  const colors = useMemo(() => splitValues(colorText), [colorText]);
  const sizeOptions = useMemo(() => [...new Set([...STANDARD_SIZES, ...selectedCustomSizes])], [selectedCustomSizes]);
  const sizes = useMemo(() => [...new Set([...selectedSizes, ...selectedCustomSizes])], [selectedSizes, selectedCustomSizes]);
  const combinations = useMemo(() => colors.flatMap((color) => sizes.map((size) => ({ color, size, key: combinationKey(color, size) }))), [colors, sizes]);
  const isOptionValueHidden = (optionName, value) => Boolean(hiddenOptionValues[optionValueKey(optionName, value)]);
  const toggleOptionValueHidden = (optionName, value) => {
    const key = optionValueKey(optionName, value);
    setHiddenOptionValues((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddCustomSize = () => {
    const nextSizes = splitValues(customSizeDraft);
    if (!nextSizes.length) return;

    setSelectedCustomSizes((prev) => [
      ...prev,
      ...nextSizes.filter((size) => !STANDARD_SIZES.includes(size) && !prev.includes(size)),
    ]);
    setCustomSizeDraft('');
    setIsAddingCustomSize(false);
    clearFieldError('variants');
  };

  const uploadedImages = images.filter((img) => !img.isUploading && img.url_product_image);
  const parentCollections = useMemo(
    () => collections.filter((collection) => !collection.parent_collection_id),
    [collections],
  );
  const childCollections = useMemo(
    () => collections.filter((collection) => collection.parent_collection_id),
    [collections],
  );

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const scrollToField = (field) => {
    const target = fieldRefs[field]?.current;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const focusTarget = target.matches?.('input, textarea, button')
      ? target
      : target.querySelector('input, textarea, button');
    focusTarget?.focus({ preventScroll: true });
  };

  // Fetch Categories & Collections references through one cached metadata request.
  useEffect(() => {
    let mounted = true;
    const fetchRefs = async () => {
      try {
        const metaRes = await queryClient.fetchQuery({
          queryKey: ['admin-products-meta'],
          staleTime: 1000 * 60 * 10,
          queryFn: getAdminProductMetaApi,
        });
        const meta = requireApiObject(metaRes, 'Metadata sản phẩm');
        if (!Array.isArray(meta.categories) || !Array.isArray(meta.collections)) {
          throw new Error('Metadata sản phẩm không hợp lệ');
        }
        if (mounted) {
          setCategories(organizeCategories(meta.categories));
          setCollections(meta.collections);
        }
      } catch {
        if (mounted) setError('Không thể tải danh mục hoặc bộ sưu tập.');
      }
    };
    fetchRefs();
    return () => { mounted = false; };
  }, [queryClient]);

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
        const p = requireApiObject(res, 'Chi tiết sản phẩm quản trị');
        if (!mounted) return;
        setProductStatus(p.status_product);

        const options = Array.isArray(p.options) ? p.options : [];
        const hiddenValues = {};
        options.forEach((option) => {
          (option.values || []).forEach((rawValue) => {
            const value = typeof rawValue === 'string' ? rawValue : rawValue.value_option;
            if (value) hiddenValues[optionValueKey(option.name_option, value)] = Boolean(rawValue?.is_hidden);
          });
        });
        setHiddenOptionValues(hiddenValues);
        const colorOption = options.find((opt) => opt.name_option?.toLowerCase().includes('màu') || opt.name_option?.toLowerCase().includes('color'));
        const sizeOption = options.find((opt) => opt.name_option?.toLowerCase().includes('kích') || opt.name_option?.toLowerCase().includes('size'));

        let initialColors = colorOption ? colorOption.values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean).map((value) => String(value).trim().toUpperCase()) : [];
        let initialSizes = sizeOption ? sizeOption.values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean).map((value) => String(value).trim().toUpperCase()) : [];

        if (initialColors.length === 0 && options[0]?.values) {
          initialColors = options[0].values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean).map((value) => String(value).trim().toUpperCase());
        }
        if (initialSizes.length === 0 && options[1]?.values) {
          initialSizes = options[1].values.map((v) => (typeof v === 'string' ? v : v.value_option)).filter(Boolean).map((value) => String(value).trim().toUpperCase());
        }

        setColorText(initialColors.join(', '));
        setSelectedSizes(initialSizes.filter((s) => STANDARD_SIZES.includes(s)));
        const initialCustomSizes = initialSizes.filter((s) => !STANDARD_SIZES.includes(s));
        setSelectedCustomSizes(initialCustomSizes);

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
            const val = String(ov.value_option || ov.value || '').trim().toUpperCase();
            if (optName.includes('màu') || optName.includes('color')) vColor = val;
            else if (optName.includes('size') || optName.includes('kích')) vSize = val;
            else if (initialColors.includes(val)) vColor = val;
            else if (initialSizes.includes(val)) vSize = val;
          });

          if (!vColor && v.option_values?.[0]) vColor = String(v.option_values[0].value_option || v.option_values[0].value || '').trim().toUpperCase();
          if (!vSize && v.option_values?.[1]) vSize = String(v.option_values[1].value_option || v.option_values[1].value || '').trim().toUpperCase();

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
              stock: v.inventory?.quantity_stock ?? '',
              is_active: v.is_active,
            };
          }
        });
        setVariants(variantMap);
        const firstVariant = p.variants?.[0];
        if (firstVariant) {
          const price = Number(firstVariant.price || 0);
          const salePrice = Number(firstVariant.sale_price || 0);
          setDefaultStock(firstVariant.inventory?.quantity_stock ?? '');
          setDefaultPrice(price ? formatNumberWithDots(price) : '');
          setDefaultSalePercent(
            price > 0 && salePrice > 0 && salePrice < price
              ? String(Math.round((1 - salePrice / price) * 100))
              : '',
          );
        }

        // Populate images
        setImages((p.images || []).map((img, idx) => ({
          product_image_id: img.product_image_id,
          product_option_value_id: img.product_option_value_id ?? null,
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

  useEffect(() => {
    if (!isEditMode || loadingProduct || initialStructureSignatureRef.current !== null) return;
    initialStructureSignatureRef.current = buildProductStructureSignature({
      form,
      colorText,
      sizes,
      hiddenOptionValues,
      defaultPrice,
      defaultSalePercent,
      defaultStock,
      variants,
      images,
    });
  }, [
    isEditMode,
    loadingProduct,
    form,
    colorText,
    sizes,
    hiddenOptionValues,
    defaultPrice,
    defaultSalePercent,
    defaultStock,
    variants,
    images,
  ]);

  const handleImageUpload = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;
    e.target.value = ''; // Reset input to allow selecting same files again

    const newItems = rawFiles.map((file, i) => ({
      __tempId: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      url_product_image: URL.createObjectURL(file),
      isUploading: true,
      progress: 5,
      is_thumbnail: images.length === 0 && i === 0,
      position: images.length + i,
    }));

    setImages((prev) => [...prev, ...newItems]);

    // Upload concurrently with live individual progress
    await Promise.all(
      newItems.map(async (item) => {
        try {
          const res = await uploadAdminProductImagesApi([item.file], (progressEvent) => {
            const percent = progressEvent.total
              ? Math.min(95, Math.round((progressEvent.loaded * 100) / progressEvent.total))
              : 60;
            setImages((prev) =>
              prev.map((img) => (img.__tempId === item.__tempId ? { ...img, progress: percent } : img))
            );
          });
          const uploaded = requireApiArray(res, 'Ảnh sản phẩm tải lên');
          const serverUrl = uploaded[0]?.url;
          if (serverUrl) {
            setImages((prev) =>
              prev.map((img) =>
                img.__tempId === item.__tempId
                  ? {
                      ...img,
                      url_product_image: serverUrl,
                      isUploading: false,
                      progress: 100,
                    }
                  : img
              )
            );
          }
        } catch {
          toast.error(`Không thể tải lên ảnh: ${item.file.name}`);
          setImages((prev) => prev.filter((img) => img.__tempId !== item.__tempId));
        }
      })
    );
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
        const created = requireApiObject(res, 'Danh mục');
        catId = String(created.category_id || created.id);
        toast.success('Đã tạo danh mục mới!');
        setForm((prev) => ({ ...prev, primary_category_id: catId }));
      }
      await refreshCategories();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
        queryClient.invalidateQueries({ queryKey: ['categories-public-tree'] }),
        queryClient.invalidateQueries({ queryKey: ['category-detail'] }),
      ]);
      broadcastQueryInvalidation([
        ['admin-categories'],
        ['categories-public-tree'],
        ['category-detail'],
      ]);
      setCategoryModal({ open: false, editing: null, initialParentId: '' });
    } catch {
      toast.error('Không thể lưu danh mục');
    }
  };

  const handleQuickCollectionSubmit = async (collectionData) => {
    try {
      setIsCreatingCollection(true);
      const response = await createCollectionApi(collectionData);
      const created = requireApiObject(response, 'Bộ sưu tập');
      const createdId = created.collection_id || created.id;

      const collectionsRes = await getAdminCollectionsApi();
      setCollections(responseItems(collectionsRes));

      if (collectionData.parent_collection_id && createdId) {
        setForm((prev) => ({
          ...prev,
          collection_ids: [...new Set([...prev.collection_ids, String(createdId)])],
        }));
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-collections'] }),
        queryClient.invalidateQueries({ queryKey: ['collections-public-list'] }),
        queryClient.invalidateQueries({ queryKey: ['collection-detail'] }),
      ]);
      broadcastQueryInvalidation([
        ['admin-collections'],
        ['collections-public-list'],
        ['collection-detail'],
      ]);
      setCollectionModalOpen(false);
      toast.success(collectionData.parent_collection_id ? 'Đã tạo và chọn bộ sưu tập mới.' : 'Đã tạo nhóm bộ sưu tập mới.');
    } catch (collectionError) {
      toast.error(collectionError.response?.data?.message || 'Không thể tạo bộ sưu tập.');
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handleSave = async (publishNow = false) => {
    const nextErrors = {};
    if (!form.name_product.trim()) nextErrors.name = 'Vui lòng nhập tên sản phẩm.';
    if (!form.primary_category_id) nextErrors.category = 'Vui lòng chọn danh mục chính.';
    if (combinations.length === 0) nextErrors.variants = 'Vui lòng chọn ít nhất 1 màu sắc và 1 kích thước.';

    const price = parsePriceNumber(defaultPrice);
    if (price <= 0) nextErrors.price = 'Vui lòng nhập giá bán hợp lệ.';
    if (images.some((img) => img.isUploading)) nextErrors.images = 'Ảnh đang tải lên, vui lòng đợi hoàn tất.';
    if (publishNow && uploadedImages.length === 0) nextErrors.images = 'Cần ít nhất 1 ảnh trước khi đăng bán.';
    if (publishNow && defaultStock === '') nextErrors.inventory = 'Hãy nhập tồn kho ban đầu trước khi đăng bán.';

    setFieldErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) {
      toast.error(nextErrors[firstError]);
      scrollToField(firstError);
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
      primary_category_id: Number(form.primary_category_id),
      collection_ids: form.collection_ids.map(Number),
      options: [
        { name_option: 'Màu sắc', values: colors.map((value) => ({ value_option: value, is_hidden: isOptionValueHidden('Màu sắc', value) })) },
        { name_option: 'Kích thước', values: sizes.map((value) => ({ value_option: value, is_hidden: isOptionValueHidden('Kích thước', value) })) },
      ],
      variants: payloadVariants,
      images: images
        .filter((img) => !img.isUploading && img.url_product_image)
        .map((img, idx) => ({
          ...(img.product_image_id ? { product_image_id: img.product_image_id } : {}),
          url_product_image: img.url_product_image,
          is_thumbnail: Boolean(img.is_thumbnail),
          position_product_image: idx,
        })),
    };

    const currentStructureSignature = buildProductStructureSignature({
      form,
      colorText,
      sizes,
      hiddenOptionValues,
      defaultPrice,
      defaultSalePercent,
      defaultStock,
      variants,
      images,
    });
    const canUseFastUpdate = Boolean(
      isEditMode
      && !publishNow
      && initialStructureSignatureRef.current
      && initialStructureSignatureRef.current === currentStructureSignature,
    );

    try {
      setSubmittingAction(publishNow ? 'publish' : 'draft');
      if (canUseFastUpdate) {
        await updateAdminProductApi(productId, {
          name_product: form.name_product.trim(),
          description: form.description || '',
        });
        toast.success('Cập nhật sản phẩm thành công!');
      } else if (isEditMode) {
        const updatePayload = {
          ...payload,
          ...(publishNow ? { status_product: 'active' } : {}),
        };
        await updateAdminFullProductApi(productId, updatePayload);
        toast.success(publishNow ? 'Đăng bán sản phẩm thành công!' : 'Cập nhật sản phẩm thành công!');
      } else {
        const createPayload = {
          ...payload,
          status_product: publishNow ? 'active' : 'draft',
        };
        await createAdminFullProductApi(createPayload);
        toast.success(publishNow ? 'Đăng bán sản phẩm thành công!' : 'Tạo nháp sản phẩm thành công!');
      }
      const invalidationKeys = [
        ['admin-products'],
        ['products'],
        ['product-detail'],
        ...(canUseFastUpdate ? [] : [['admin-inventory']]),
      ];
      await Promise.all(invalidationKeys.map((queryKey) => queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none',
      })));
      broadcastQueryInvalidation(invalidationKeys);
      router.push('/admin/products');
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
      setSubmittingAction(null);
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
            href="/admin/products"
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
            isLoading={submittingAction === 'draft'}
            disabled={submittingAction !== null}
          >
            Lưu bản nháp
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleSave(true)}
            isLoading={submittingAction === 'publish'}
            disabled={submittingAction !== null}
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
            
            <div ref={nameFieldRef}>
              <InputField
                label="Tên sản phẩm *"
                placeholder="VD: Áo Thun Oversized Streetwear Gritmode"
                value={form.name_product}
                error={fieldErrors.name}
                onChange={(e) => {
                  clearFieldError('name');
                  setForm((p) => ({ ...p, name_product: e.target.value }));
                }}
              />
            </div>

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
          <div ref={variantsSectionRef} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 scroll-mt-24">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-3">
              2. Màu sắc, kích thước & giá bán
            </h2>
            {fieldErrors.variants && <p className="text-xs font-bold text-rose-500">{fieldErrors.variants}</p>}

            {/* Colors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-2">
                Màu sắc (phân cách bằng dấu phẩy) *
              </label>
              <input
                type="text"
                placeholder="VD: Đen, Trắng, Xám Tiêu, Rêu"
                value={colorText}
                onChange={(e) => {
                  clearFieldError('variants');
                  setColorText(e.target.value.toUpperCase());
                }}
                className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {colors.map((c, i) => {
                  const isHidden = isOptionValueHidden('Màu sắc', c);
                  return (
                    <div
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                        isHidden
                          ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                          : 'bg-black text-white dark:bg-white dark:text-black'
                      }`}
                    >
                      <span className={isHidden ? 'line-through' : ''}>{c}</span>
                      <button
                        type="button"
                        onClick={() => toggleOptionValueHidden('Màu sắc', c)}
                        aria-pressed={isHidden}
                        aria-label={`${isHidden ? 'Hiện' : 'Ẩn'} màu ${c} trên cửa hàng`}
                        title={isHidden ? 'Hiện trên cửa hàng' : 'Ẩn trên cửa hàng'}
                        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white/20 dark:hover:bg-black/10"
                      >
                        <Icon icon={isHidden ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="text-sm" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Kích thước tiêu chuẩn *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomSize(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
                >
                  <Icon icon="solar:add-circle-linear" />
                  Thêm size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((s) => {
                  const isStandardSize = STANDARD_SIZES.includes(s);
                  const isSelected = isStandardSize ? selectedSizes.includes(s) : selectedCustomSizes.includes(s);
                  const isHidden = isOptionValueHidden('Kích thước', s);
                  return (
                    <div
                      key={s}
                      className={`inline-flex items-stretch overflow-hidden rounded-xl border transition-all ${
                        isHidden || !isSelected ? 'border-neutral-200 dark:border-neutral-800' : 'border-black dark:border-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          clearFieldError('variants');
                          if (isStandardSize) {
                            setSelectedSizes((prev) => isSelected ? prev.filter((item) => item !== s) : [...prev, s]);
                          } else {
                            setSelectedCustomSizes((prev) => isSelected ? prev.filter((item) => item !== s) : [...prev, s]);
                          }
                        }}
                        className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                          isHidden
                            ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500 line-through'
                            : isSelected
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-neutral-50 text-neutral-600 dark:bg-neutral-950 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {s}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOptionValueHidden('Kích thước', s)}
                        aria-pressed={isHidden}
                        aria-label={`${isHidden ? 'Hiện' : 'Ẩn'} size ${s} trên cửa hàng`}
                        title={isHidden ? 'Hiện trên cửa hàng' : 'Ẩn trên cửa hàng'}
                        className={`inline-flex w-8 items-center justify-center border-l text-sm transition-colors cursor-pointer ${
                          isHidden
                            ? 'border-neutral-200 bg-neutral-100 text-neutral-400 hover:text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500 dark:hover:text-white'
                            : 'border-white/20 bg-black/10 text-current hover:bg-black/20 dark:border-black/10 dark:bg-white/10 dark:hover:bg-white/20'
                        }`}
                      >
                        <Icon icon={isHidden ? 'solar:eye-closed-linear' : 'solar:eye-linear'} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Icon icon="solar:eye-linear" />
                Bấm biểu tượng mắt để ẩn/hiện option trên cửa hàng.
              </p>

              {isAddingCustomSize && (
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
                  <input
                    type="text"
                    value={customSizeDraft}
                    onChange={(event) => setCustomSizeDraft(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddCustomSize();
                      }
                    }}
                    placeholder="Nhập size, ví dụ 3XL hoặc 31"
                    autoFocus
                    className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs outline-none focus:border-black dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSize}
                    className="rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-transform hover:scale-[1.02] dark:bg-white dark:text-black"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomSizeDraft('');
                      setIsAddingCustomSize(false);
                    }}
                    className="rounded-full border border-neutral-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:border-black hover:text-black dark:border-neutral-700 dark:hover:border-white dark:hover:text-white"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>

            {/* Shared pricing */}
              <div ref={priceFieldRef} className={`p-4 rounded-2xl border space-y-3 ${fieldErrors.price ? 'border-rose-300 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20' : 'border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950'}`}>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Giá bán chung
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Giá bán (VND)"
                  value={formatNumberWithDots(defaultPrice)}
                  onChange={(e) => {
                    clearFieldError('price');
                    setDefaultPrice(formatNumberWithDots(e.target.value));
                  }}
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
                  onChange={(e) => {
                    clearFieldError('inventory');
                    setDefaultStock(e.target.value);
                  }}
                  ref={inventoryFieldRef}
                  aria-invalid={Boolean(fieldErrors.inventory)}
                  className={`rounded-xl border bg-white px-3 py-2 text-xs font-bold dark:bg-neutral-900 ${fieldErrors.inventory ? 'border-rose-500' : 'border-neutral-200 dark:border-neutral-800'}`}
                />
              </div>
              {fieldErrors.price && <p className="text-xs font-bold text-rose-500">{fieldErrors.price}</p>}
              {fieldErrors.inventory && <p className="text-xs font-bold text-rose-500">{fieldErrors.inventory}</p>}
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Category, Collections & Images */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Categories */}
          <div ref={categorySectionRef} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">Danh mục chính *</span>
              <button
                type="button"
                onClick={() => setCategoryModal({ open: true, editing: null, initialParentId: '' })}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
              >
                <Icon icon="solar:add-circle-linear" />
                Tạo mới
              </button>
            </div>

            {/* Collapsible Category Tree Dropdown */}
            <div className="relative" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setCatDropdownOpen((v) => !v)}
                aria-expanded={catDropdownOpen}
                aria-haspopup="listbox"
                aria-controls="admin-category-options"
                aria-invalid={Boolean(fieldErrors.category)}
                onFocus={() => clearFieldError('category')}
                className={`w-full flex items-center justify-between rounded-2xl border bg-neutral-50 px-4 py-3 text-xs font-bold text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:bg-neutral-950 dark:focus-visible:ring-white ${fieldErrors.category ? 'border-rose-500' : 'border-neutral-200 dark:border-neutral-800'}`}
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
                <div id="admin-category-options" role="listbox" className="absolute z-30 top-full mt-1 left-0 right-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
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
                            onClick={() => {
                              clearFieldError('category');
                              setForm((prev) => ({ ...prev, primary_category_id: root.__id }));
                              setCatDropdownOpen(false);
                            }}
                            role="option"
                            aria-selected={isRootSelected}
                            className={`group flex cursor-pointer items-center gap-2 px-4 py-2.5 select-none transition-colors ${
                              isRootSelected
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'text-neutral-400'
                            }`}
                          >
                            {/* Expand toggle */}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedCats((prev) => ({ ...prev, [root.__id]: !prev[root.__id] })); }}
                              aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} ${root.name_category || root.name}`}
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
                              aria-label={`Chỉnh sửa ${root.name_category || root.name}`}
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
                                  onClick={() => { clearFieldError('category'); setForm((p) => ({ ...p, primary_category_id: child.__id })); setCatDropdownOpen(false); }}
                                >
                                  ↳ {child.name_category || child.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setCategoryModal({ open: true, editing: child, initialParentId: child.__parentId || '' }); setCatDropdownOpen(false); }}
                                  aria-label={`Chỉnh sửa ${child.name_category || child.name}`}
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
            {fieldErrors.category && <p className="text-xs font-bold text-rose-500">{fieldErrors.category}</p>}
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
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 block">
                Bộ sưu tập
              </span>
              <button
                type="button"
                onClick={() => setCollectionModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white dark:focus-visible:ring-white"
              >
                <Icon icon="solar:add-circle-linear" />
                Tạo mới
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCollectionDropdownOpen((value) => !value)}
                aria-expanded={collectionDropdownOpen}
                aria-haspopup="listbox"
                className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-xs font-bold text-black outline-none transition-colors hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:border-neutral-600 dark:focus-visible:ring-white"
              >
                <span className={form.collection_ids.length ? 'text-black dark:text-white' : 'text-neutral-400'}>
                  {form.collection_ids.length
                    ? `Đã chọn ${form.collection_ids.length} bộ sưu tập`
                    : childCollections.length
                      ? '-- Chọn bộ sưu tập --'
                      : '-- Chưa có bộ sưu tập con --'}
                </span>
                <Icon icon={collectionDropdownOpen ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} className="text-neutral-400" />
              </button>

              {collectionDropdownOpen && (
                <div role="listbox" className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
                  {parentCollections.map((parent) => {
                    const parentId = String(parent.collection_id || parent.id);
                    const children = childCollections.filter((child) => String(child.parent_collection_id) === parentId);
                    const isExpanded = expandedCollections[parentId];
                    return (
                      <div key={parentId}>
                        <div className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wide text-neutral-400 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
                          <button
                            type="button"
                            onClick={() => setExpandedCollections((prev) => ({ ...prev, [parentId]: !prev[parentId] }))}
                            aria-label={`${isExpanded ? 'Thu gọn' : 'Mở rộng'} ${parent.name_collection || parent.name}`}
                            className={`flex size-4 items-center justify-center transition-transform ${children.length === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                          >
                            <Icon icon={isExpanded ? 'solar:alt-arrow-down-linear' : 'solar:alt-arrow-right-linear'} />
                          </button>
                          <span className="truncate">{parent.name_collection || parent.name}</span>
                        </div>

                        {isExpanded && children.map((col) => {
                          const colId = String(col.collection_id || col.id);
                          const isSelected = form.collection_ids.includes(colId);
                          return (
                            <label key={colId} className="flex cursor-pointer items-center gap-3 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(event) => {
                                  setForm((prev) => ({
                                    ...prev,
                                    collection_ids: event.target.checked
                                      ? [...new Set([...prev.collection_ids, colId])]
                                      : prev.collection_ids.filter((id) => id !== colId),
                                  }));
                                }}
                                className="size-4 cursor-pointer rounded border-neutral-300"
                              />
                              <span className="truncate">↳ {col.name_collection || col.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })}

                  {parentCollections.length === 0 && (
                    <div className="px-3 py-2.5 text-xs text-neutral-400">-- Chưa có nhóm cha --</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Images Upload & Gallery */}
          <div ref={imagesSectionRef} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 scroll-mt-24">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Hình ảnh sản phẩm ({images.length})
              </span>
            </div>

            <label ref={imageFieldRef} className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors cursor-pointer bg-neutral-50 dark:bg-neutral-950 ${fieldErrors.images ? 'border-rose-400' : 'border-neutral-300 dark:border-neutral-700'}`}>
              <Icon icon="solar:cloud-upload-linear" className="text-3xl text-neutral-400 mb-2" />
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                Bấm để chọn hoặc kéo thả ảnh vào đây
              </span>
              <span className="text-[10px] text-neutral-400 mt-1">JPEG, PNG, WebP (Tối đa 10MB)</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {fieldErrors.images && <p className="text-xs font-bold text-rose-500">{fieldErrors.images}</p>}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {images.map((img, i) => (
                  <div
                    key={img.__tempId || img.url_product_image || i}
                    className={`relative rounded-2xl overflow-hidden border aspect-square group transition-all ${
                      img.is_thumbnail
                        ? 'ring-2 ring-black dark:ring-white border-transparent'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <img
                      src={img.url_product_image}
                      alt={`img-${i}`}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        img.isUploading ? 'opacity-40 filter blur-[1px]' : 'opacity-100'
                      }`}
                    />
                    
                    {/* Live Upload Progress Ring & Percentage */}
                    {img.isUploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-white z-10 select-none animate-fade-in">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-white/20"
                              strokeWidth="3.5"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-white transition-all duration-300 ease-out"
                              strokeDasharray={`${img.progress || 5}, 100`}
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-black font-mono">
                            {img.progress || 5}%
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/90 mt-1">
                          Đang tải lên
                        </span>
                      </div>
                    )}

                    {!img.isUploading && img.is_thumbnail && (
                      <span className="absolute top-2 left-2 bg-black text-white dark:bg-white dark:text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow z-10">
                        Thumbnail
                      </span>
                    )}

                    {!img.isUploading && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity z-10">
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
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {collectionModalOpen && (
        <QuickCollectionFormModal
          parentCollections={parentCollections}
          isSaving={isCreatingCollection}
          onClose={() => setCollectionModalOpen(false)}
          onSubmit={handleQuickCollectionSubmit}
        />
      )}

      {/* Floating Save Footer on mobile/desktop */}
      <div className="sticky bottom-4 z-40 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl flex items-center justify-between gap-4">
        <Link
          href="/admin/products"
          className="text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white"
        >
          Hủy bỏ
        </Link>
        <div className="flex items-center gap-3">
          <PrimaryButton
            variant="outline"
            onClick={() => handleSave(false)}
            isLoading={submittingAction === 'draft'}
            disabled={submittingAction !== null}
          >
            Lưu bản nháp
          </PrimaryButton>
          <PrimaryButton
            onClick={() => handleSave(true)}
            isLoading={submittingAction === 'publish'}
            disabled={submittingAction !== null}
          >
            {productStatus === 'draft' ? 'Đăng bán ngay' : 'Lưu thay đổi'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
