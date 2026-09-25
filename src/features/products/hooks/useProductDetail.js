/**
 * useProductDetail Hook
 * Handles product detail state, multi-option selection, variant resolving,
 * image filtering, inventory availability, and quantity bounding.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductDetailApi } from '../apis/product.api';
import {
  findVariantByOptionValues,
  isVariantAvailable,
  getProductImagesByOptionValue,
} from '../utils/product.utils';

export const useProductDetail = (productId) => {
  const [selectedOptionValues, setSelectedOptionValues] = useState({});
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const query = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await getProductDetailApi(productId);
      return res.data?.data || res.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  const product = query.data;

  // Initialize default option selections when product data loads
  useEffect(() => {
    if (product && Array.isArray(product.options) && product.options.length > 0) {
      const initialSelection = {};
      product.options.forEach((opt) => {
        if (Array.isArray(opt.values) && opt.values.length > 0) {
          // Pre-select first available value
          initialSelection[opt.product_option_id] = opt.values[0].product_option_value_id;
        }
      });
      setSelectedOptionValues(initialSelection);
      setSelectedQuantity(1);
      setSelectedImageIndex(0);
    } else {
      setSelectedOptionValues({});
      setSelectedQuantity(1);
    }
  }, [product]);

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
    return isVariantAvailable(selectedVariant);
  }, [selectedVariant]);

  // Available stock count
  const availableStock = useMemo(() => {
    if (!selectedVariant) return 0;
    if (typeof selectedVariant.quantity_available === 'number') {
      return selectedVariant.quantity_available;
    }
    if (selectedVariant.inventory?.quantity_available !== undefined) {
      return selectedVariant.inventory.quantity_available;
    }
    return 0;
  }, [selectedVariant]);

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
    setSelectedOptionValues((prev) => ({
      ...prev,
      [optionId]: Number(optionValueId),
    }));
    // Reset image index when switching color
    setSelectedImageIndex(0);
  }, []);

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
    setQuantity,
    incrementQuantity,
    decrementQuantity,
  };
};
