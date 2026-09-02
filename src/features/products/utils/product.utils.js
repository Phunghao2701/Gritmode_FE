/**
 * Product Utilities & Variant Resolvers
 * Implements core domain logic for multi-option variant matching,
 * inventory availability, image mapping, and price calculations.
 */

/**
 * Normalizes an array of option value IDs for order-independent comparison
 * @param {number[]} ids
 * @returns {number[]}
 */
export const normalizeOptionValueIds = (ids = []) => {
  return [...ids].map(Number).sort((a, b) => a - b);
};

export const slugifyProductName = (name = '') => String(name)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/**
 * Resolves the matching ProductVariant from selected option value IDs.
 * Does not depend on the order of selected options.
 *
 * @param {Array<object>} variants - List of product variants from BE
 * @param {Array<number>|Record<number, number>} selectedOptionValues - Array of IDs or Record of optionId -> optionValueId
 * @returns {object|null} Matched variant or null if not found / incomplete
 */
export const findVariantByOptionValues = (variants = [], selectedOptionValues) => {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  let selectedIds = [];
  if (Array.isArray(selectedOptionValues)) {
    selectedIds = selectedOptionValues.filter(Boolean).map(Number);
  } else if (selectedOptionValues && typeof selectedOptionValues === 'object') {
    selectedIds = Object.values(selectedOptionValues).filter(Boolean).map(Number);
  }

  if (selectedIds.length === 0) {
    // If product has single default variant without options
    if (variants.length === 1 && (!variants[0].option_values || variants[0].option_values.length === 0)) {
      return variants[0];
    }
    return null;
  }

  const normalizedSelected = normalizeOptionValueIds(selectedIds);

  for (const variant of variants) {
    // Extract option value IDs from variant
    let variantIds = [];
    if (Array.isArray(variant.option_value_ids)) {
      variantIds = variant.option_value_ids.map(Number);
    } else if (Array.isArray(variant.option_values)) {
      variantIds = variant.option_values.map((ov) => Number(ov.product_option_value_id));
    }

    const normalizedVariant = normalizeOptionValueIds(variantIds);

    // Exact match of all option value IDs
    if (
      normalizedSelected.length === normalizedVariant.length &&
      normalizedSelected.every((id, idx) => id === normalizedVariant[idx])
    ) {
      return variant;
    }
  }

  return null;
};

/**
 * Checks if a variant exists and has positive available inventory
 * @param {object|null} variant
 * @returns {boolean}
 */
export const isVariantAvailable = (variant) => {
  if (!variant) return false;
  if (typeof variant.quantity_available === 'number') {
    return variant.quantity_available > 0;
  }
  if (variant.inventory) {
    return Boolean(variant.inventory.is_available && variant.inventory.quantity_available > 0);
  }
  return false;
};

/**
 * Filters and sorts product images by position and selected option value (e.g. Color)
 * @param {Array<object>} images - List of product images
 * @param {number|null} optionValueId - Selected option value ID
 * @returns {Array<object>}
 */
export const getProductImagesByOptionValue = (images = [], optionValueId = null) => {
  if (!Array.isArray(images) || images.length === 0) return [];

  // Sort all images by position ASC, then ID ASC
  const sorted = [...images].sort((a, b) => {
    const posA = Number(a.position_product_image ?? a.position ?? 0);
    const posB = Number(b.position_product_image ?? b.position ?? 0);
    if (posA !== posB) return posA - posB;
    return (a.product_image_id ?? 0) - (b.product_image_id ?? 0);
  });

  if (!optionValueId) {
    return sorted;
  }

  const targetId = Number(optionValueId);
  const matching = sorted.filter(
    (img) => Number(img.product_option_value_id) === targetId
  );

  // If specific images exist for this option value, return them plus generic images
  if (matching.length > 0) {
    const generic = sorted.filter(
      (img) => img.product_option_value_id === null || img.product_option_value_id === undefined
    );
    return [...matching, ...generic];
  }

  return sorted;
};

import { formatPriceVND } from '../../../shared/utils/formatNumber';
export { formatPriceVND };


/**
 * Returns formatted price or price range for product list display
 * @param {number|null} minPrice
 * @param {number|null} maxPrice
 * @returns {string}
 */
export const formatProductPriceRange = (minPrice, maxPrice) => {
  if (minPrice === null || minPrice === undefined) return '0 ₫';
  if (maxPrice === null || maxPrice === undefined || minPrice === maxPrice) {
    return formatPriceVND(minPrice);
  }
  return `${formatPriceVND(minPrice)} - ${formatPriceVND(maxPrice)}`;
};
