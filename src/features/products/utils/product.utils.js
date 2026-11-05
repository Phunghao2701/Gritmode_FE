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

export const PRODUCT_IMAGE_PRESETS = Object.freeze({
  thumbnail: Object.freeze({ width: 160, quality: 'eco' }),
  card: Object.freeze({ width: 480, quality: 'good' }),
  gallery: Object.freeze({
    width: 960,
    widths: Object.freeze([640, 960, 1280, 1600]),
    quality: 'good',
    sizes: '(min-width: 1024px) 58vw, 100vw',
  }),
  zoom: Object.freeze({ width: 1600, quality: 'good' }),
});

const CLOUDINARY_UPLOAD_PATH = '/image/upload/';

const isCloudinaryTransformation = (segment = '') => (
  segment.includes(',') || /^(?:a|b|c|d|e|f|fl|g|h|l|o|q|r|s|t|u|w|x|y|z|dpr)_/i.test(segment)
);

const getCloudinaryOriginalUrl = (source) => {
  const normalizedSource = source.trim();
  const uploadIndex = normalizedSource.indexOf(CLOUDINARY_UPLOAD_PATH);
  if (uploadIndex < 0) return null;

  const pathStart = uploadIndex + CLOUDINARY_UPLOAD_PATH.length;
  const segments = normalizedSource.slice(pathStart).split('/');
  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const firstAssetIndex = segments.findIndex((segment) => !isCloudinaryTransformation(segment));
  const assetSegments = versionIndex >= 0
    ? segments.slice(versionIndex)
    : firstAssetIndex >= 0
      ? segments.slice(firstAssetIndex)
      : [];

  if (assetSegments.length === 0 || !assetSegments[0]) return null;

  return `${normalizedSource.slice(0, pathStart)}${assetSegments.join('/')}`;
};

const buildCloudinaryImageUrl = (source, transformation) => {
  if (typeof source !== 'string') return source;
  const normalizedSource = source.trim();
  if (!normalizedSource) return normalizedSource;

  const originalUrl = getCloudinaryOriginalUrl(normalizedSource);
  if (!originalUrl) return null;

  return originalUrl.replace(CLOUDINARY_UPLOAD_PATH, `${CLOUDINARY_UPLOAD_PATH}${transformation}/`);
};

/**
 * Creates the canonical Cloudinary delivery URL for a requested rendition.
 * Stored, versioned asset URLs are normalized first so existing transform
 * strings (including f_auto) cannot accumulate into a different cache key.
 */
export const getSizedProductImageUrl = (source, width, { quality = 'good' } = {}) => {
  if (typeof source !== 'string') return source;
  const normalizedSource = source.trim();
  if (!normalizedSource || !width) return normalizedSource;
  const normalizedQuality = quality === 'eco' ? 'eco' : 'good';

  if (normalizedSource.includes(CLOUDINARY_UPLOAD_PATH)) {
    return buildCloudinaryImageUrl(
      normalizedSource,
      `q_auto:${normalizedQuality},w_${width},c_limit`,
    ) || normalizedSource;
  }

  if (normalizedSource.includes('images.unsplash.com')) {
    const url = new URL(normalizedSource);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('w', String(width));
    if (normalizedQuality === 'eco') url.searchParams.set('q', '70');
    return url.toString();
  }

  return normalizedSource;
};

export const getProductImagePresetUrl = (source, presetName) => {
  const preset = PRODUCT_IMAGE_PRESETS[presetName];
  if (!preset) return typeof source === 'string' ? source.trim() : source;
  return getSizedProductImageUrl(source, preset.width, { quality: preset.quality });
};

export const getProductImageSrcSet = (source, widths = [320, 640, 960], options = {}) => (
  widths.map((width) => `${getSizedProductImageUrl(source, width, options)} ${width}w`).join(', ')
);

export const getProductImagePresetSrcSet = (source, presetName = 'gallery') => {
  const preset = PRODUCT_IMAGE_PRESETS[presetName];
  if (!preset?.widths) return '';
  return getProductImageSrcSet(source, preset.widths, { quality: preset.quality });
};

export const getProductImagePlaceholderUrl = (source) => {
  if (typeof source !== 'string' || !source.trim()) return null;
  const normalizedSource = source.trim();
  if (normalizedSource.includes('/image/upload/')) {
    return buildCloudinaryImageUrl(normalizedSource, 'q_auto:low,w_32,e_blur:1000,c_limit');
  }
  if (normalizedSource.includes('images.unsplash.com')) {
    const url = new URL(normalizedSource);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('w', '32');
    url.searchParams.set('blur', '20');
    return url.toString();
  }
  return null;
};

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

export const optionValueAvailabilityKey = (optionId, valueId) => `${optionId}:${valueId}`;

const getVariantOptionValueIds = (variant) => {
  if (Array.isArray(variant?.option_value_ids)) {
    return variant.option_value_ids.map(Number);
  }
  if (Array.isArray(variant?.option_values)) {
    return variant.option_values.map((value) => Number(value.product_option_value_id));
  }
  return [];
};

/**
 * Resolves which option values still lead to an in-stock variant for the
 * currently selected values in the other option groups.
 */
export const getOptionValueAvailability = (options = [], variants = [], selectedOptionValues = {}) => {
  const availability = {};
  const safeVariants = Array.isArray(variants) ? variants : [];
  const hiddenValueIds = new Set(
    options.flatMap((option) => (option.values || [])
      .filter((value) => value.is_hidden)
      .map((value) => Number(value.product_option_value_id)))
  );

  options.forEach((option) => {
    (option.values || []).forEach((value) => {
      const valueId = Number(value.product_option_value_id);
      const key = optionValueAvailabilityKey(option.product_option_id, valueId);
      if (value.is_hidden) {
        availability[key] = false;
        return;
      }

      availability[key] = safeVariants.some((variant) => {
        if (!isVariantAvailable(variant)) return false;
        const variantValueIds = getVariantOptionValueIds(variant);
        if (variantValueIds.some((id) => hiddenValueIds.has(id))) return false;
        if (!variantValueIds.includes(valueId)) return false;

        return Object.entries(selectedOptionValues || {}).every(([selectedOptionId, selectedValueId]) => {
          if (String(selectedOptionId) === String(option.product_option_id)) return true;
          return variantValueIds.includes(Number(selectedValueId));
        });
      });
    });
  });

  return availability;
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

import { formatPriceVND } from '../../../shared/utils/formatNumber.js';
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
