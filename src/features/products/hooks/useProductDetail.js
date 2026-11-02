/**
 * useProductDetail Hook
 * Handles product detail state, multi-option selection, variant resolving,
 * image filtering, inventory availability, and quantity bounding.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductAvailabilityApi, getProductDetailApi } from '../apis/product.api';
import {
  findVariantByOptionValues,
  isVariantAvailable,
  getOptionValueAvailability,
  optionValueAvailabilityKey,
  getProductImagesByOptionValue,
} from '../utils/product.utils';
import { requireApiObject } from '../../../shared/services/responseContract';

export const useProductDetail = (productId) => {
  const [selectedOptionValues, setSelectedOptionValues] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const query = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await getProductDetailApi(productId);
      return requireApiObject(res, 'Chi tiết sản phẩm');
    },
    enabled: !!productId,
    // The route payload is prefetched on user intent. Reuse it on navigation;
    // live inventory is fetched separately below.
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: 'always',
  });

  const detailProduct = query.data;
  const availabilityQuery = useQuery({
    queryKey: ['product-availability', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await getProductAvailabilityApi(productId);
      return requireApiObject(res, 'Tồn kho sản phẩm');
    },
    enabled: !!productId,
    staleTime: 1500,
    refetchOnWindowFocus: 'always',
  });

  const isAvailabilityReady = availabilityQuery.isSuccess;
  const product = useMemo(() => {
    if (!detailProduct || !isAvailabilityReady) return detailProduct;

    const stockByVariantId = new Map(
      (availabilityQuery.data?.variants || []).map((item) => [
        Number(item.product_variant_id),
        Math.max(0, Number(item.quantity_available) || 0),
      ]),
    );

    return {
      ...detailProduct,
      variants: (detailProduct.variants || []).map((variant) => {
        const quantityAvailable = stockByVariantId.get(Number(variant.product_variant_id)) || 0;
        return {
          ...variant,
          quantity_available: quantityAvailable,
          inventory: {
            ...(variant.inventory || {}),
            quantity_available: quantityAvailable,
            is_available: quantityAvailable > 0,
          },
        };
      }),
    };
  }, [availabilityQuery.data, detailProduct, isAvailabilityReady]);

  // Initialize default option selections when product data loads
  useEffect(() => {
    if (detailProduct && Array.isArray(detailProduct.options) && detailProduct.options.length > 0) {
      const initialSelection = {};
      const hiddenValueIds = new Set(detailProduct.options.flatMap((option) => (option.values || [])
        .filter((value) => value.is_hidden)
        .map((value) => Number(value.product_option_value_id))));
      const firstAvailableVariant = (detailProduct.variants || []).find((variant) => {
        if (!isVariantAvailable(variant)) return false;
        return !(variant.option_values || []).some((value) => (
          value.is_hidden || hiddenValueIds.has(Number(value.product_option_value_id))
        ));
      });
      detailProduct.options.forEach((opt) => {
        if (Array.isArray(opt.values) && opt.values.length > 0) {
          const visibleValues = opt.values.filter((value) => !value.is_hidden);
          const variantValueId = firstAvailableVariant?.option_values?.find((variantValue) =>
            visibleValues.some((value) => Number(value.product_option_value_id) === Number(variantValue.product_option_value_id))
          )?.product_option_value_id;
          // Do not select an unavailable value as a fallback. When every
          // variant is sold out, leave the option unselected so the UI cannot
          // imply that an unavailable size/color is active.
          if (variantValueId !== undefined) {
            initialSelection[opt.product_option_id] = Number(variantValueId);
          }
        }
      });
      setSelectedOptionValues(initialSelection);
      setSelectedQuantity(1);
      setSelectedImageIndex(0);
    } else {
      setSelectedOptionValues({});
      setSelectedQuantity(1);
    }
  }, [detailProduct]);

  const availableOptionValues = useMemo(() => getOptionValueAvailability(
    product?.options || [],
    product?.variants || [],
    selectedOptionValues,
  ), [product, selectedOptionValues]);

  const hasAvailableVariant = useMemo(() => (
    (product?.variants || []).some((variant) => (
      isVariantAvailable(variant) && !(variant.option_values || []).some((value) => value.is_hidden)
    ))
  ), [product]);

  // Resolve matching variant
  const selectedVariant = useMemo(() => {
    if (!product || !Array.isArray(product.variants)) return null;
    return findVariantByOptionValues(product.variants, selectedOptionValues);
  }, [product, selectedOptionValues]);

  // Check if all product options are selected
  const isAllOptionsSelected = useMemo(() => {
    if (!product || !Array.isArray(product.options) || product.options.length === 0) return true;
    return product.options.every((opt) => Boolean(selectedOptionValues[opt.product_option_id]));
  }, [product, selectedOptionValues]);

  // Check availability
  const isAvailable = useMemo(() => {
    return isAvailabilityReady && isVariantAvailable(selectedVariant);
  }, [isAvailabilityReady, selectedVariant]);

  // Available stock count
  const availableStock = useMemo(() => {
    if (!isAvailabilityReady || !selectedVariant) return 0;
    if (typeof selectedVariant.quantity_available === 'number') {
      return selectedVariant.quantity_available;
    }
    if (selectedVariant.inventory?.quantity_available !== undefined) {
      return selectedVariant.inventory.quantity_available;
    }
    return 0;
  }, [isAvailabilityReady, selectedVariant]);

  // Effective price
  const displayPrice = useMemo(() => {
    const effectivePrice = Number(selectedVariant?.effective_price);
    if (selectedVariant && Number.isFinite(effectivePrice)) {
      return effectivePrice;
    }
    const variantPrice = Number(selectedVariant?.price);
    if (selectedVariant && Number.isFinite(variantPrice)) {
      return variantPrice;
    }
    if (product) {
      return product.min_price || product.price || 0;
    }
    return 0;
  }, [selectedVariant, product]);

  const originalPrice = Number(selectedVariant?.price) || displayPrice;
  const hasSale = Boolean(
    selectedVariant && Number(selectedVariant.effective_price) < Number(selectedVariant.price),
  );

  // Identify Color option value for image filtering
  const colorOptionValueId = useMemo(() => {
    if (!product || !Array.isArray(product.options)) return null;
    const colorOpt = product.options.find((opt) =>
      opt.name_option?.toLowerCase().includes('color') ||
      opt.name_option?.toLowerCase().includes('màu')
    );
    if (!colorOpt) return null;
    return selectedOptionValues[colorOpt.product_option_id] || null;
  }, [product, selectedOptionValues]);

  // Display images filtered by selected option value
  const displayImages = useMemo(() => {
    if (!product || !Array.isArray(product.images)) return [];
    return getProductImagesByOptionValue(product.images, colorOptionValueId);
  }, [product, colorOptionValueId]);

  // Action: Select option value
  const selectOptionValue = useCallback((optionId, optionValueId) => {
    const option = product?.options?.find((item) => String(item.product_option_id) === String(optionId));
    const value = option?.values?.find((item) => Number(item.product_option_value_id) === Number(optionValueId));
    const availabilityKey = optionValueAvailabilityKey(optionId, optionValueId);
    if (!value || value.is_hidden || (isAvailabilityReady && availableOptionValues[availabilityKey] === false)) return;

    setSelectedOptionValues((prev) => ({
      ...prev,
      [optionId]: Number(optionValueId),
    }));
    // Reset image index when switching color
    setSelectedImageIndex(0);
  }, [availableOptionValues, isAvailabilityReady, product]);

  // Action: Change quantity (bounded between 1 and availableStock)
  const setQuantity = useCallback((qty) => {
    const num = Number(qty);
    if (isNaN(num) || num < 1) {
      setSelectedQuantity(1);
    } else {
      setSelectedQuantity(num);
    }
  }, []);

  const incrementQuantity = useCallback(() => {
    setSelectedQuantity((prev) => {
      if (availableStock > 0 && prev >= availableStock) return prev;
      return prev + 1;
    });
  }, [availableStock]);

  const decrementQuantity = useCallback(() => {
    setSelectedQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  return {
    ...query,
    product,
    isLoadingProduct: query.isLoading,
    isAvailabilityReady,
    isAvailabilityError: availabilityQuery.isError,
    refetchAvailability: availabilityQuery.refetch,
    selectedOptionValues,
    availableOptionValues,
    hasAvailableVariant,
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
    setQuantity,
    incrementQuantity,
    decrementQuantity,
  };
};
