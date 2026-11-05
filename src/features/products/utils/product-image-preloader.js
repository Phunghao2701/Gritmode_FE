import {
  getProductImagePresetSrcSet,
  getProductImagePresetUrl,
  PRODUCT_IMAGE_PRESETS,
} from './product.utils';

const GALLERY_PRESET = PRODUCT_IMAGE_PRESETS.gallery;
const inFlightGalleryRequests = new Map();

/**
 * Preloads the responsive gallery rendition selected for the current viewport.
 * In-flight requests are shared between Home and ProductDetail so navigation
 * can raise the same request's priority instead of starting another download.
 */
export const preloadProductGalleryImage = (image, priority = 'low') => {
  if (typeof window === 'undefined' || !image?.url_product_image) {
    return Promise.resolve(false);
  }

  const source = image.url_product_image.trim();
  if (!source) return Promise.resolve(false);

  const requestKey = `${source}|${GALLERY_PRESET.sizes}|${GALLERY_PRESET.widths.join(',')}`;
  const existingRequest = inFlightGalleryRequests.get(requestKey);
  if (existingRequest) {
    if (priority === 'high') existingRequest.image.fetchPriority = 'high';
    return priority === 'high' ? existingRequest.decode() : existingRequest.loadPromise;
  }

  const preload = new window.Image();
  preload.decoding = 'async';
  preload.fetchPriority = priority;
  preload.sizes = GALLERY_PRESET.sizes;

  let resolveLoad;
  const loadPromise = new Promise((resolve) => {
    resolveLoad = resolve;
  });
  const request = {
    image: preload,
    loadPromise,
    decodePromise: null,
    decode() {
      if (!this.decodePromise) {
        this.decodePromise = this.loadPromise.then(async (loaded) => {
          if (!loaded) return false;
          if (typeof this.image.decode === 'function') {
            try {
              await this.image.decode();
            } catch {
              // The browser can still render an image when decode() rejects.
            }
          }
          return this.image.naturalWidth > 0;
        });
      }
      return this.decodePromise;
    },
  };

  const finishLoad = (loaded) => resolveLoad(Boolean(loaded && preload.naturalWidth > 0));
  preload.onload = () => finishLoad(true);
  preload.onerror = () => finishLoad(false);
  inFlightGalleryRequests.set(requestKey, request);

  // Match the main gallery <img> candidate selection exactly.
  preload.srcset = getProductImagePresetSrcSet(source, 'gallery');
  preload.src = getProductImagePresetUrl(source, 'gallery');

  if (preload.complete) finishLoad(preload.naturalWidth > 0);

  loadPromise.then(() => {
    if (inFlightGalleryRequests.get(requestKey) === request) {
      inFlightGalleryRequests.delete(requestKey);
    }
  });

  return priority === 'high' ? request.decode() : loadPromise;
};
