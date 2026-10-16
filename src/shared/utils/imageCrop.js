import { getImageProfile, requireImageProfile } from '../config/imageProfiles';

export const DEFAULT_CROP_ZOOM = 1;
export const DEFAULT_MAX_ZOOM = 3.5;

const finiteOr = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const isBlobLike = (source) => (
  typeof Blob !== 'undefined' && source instanceof Blob
);

/**
 * Normalizes the serializable crop state used by the modal and integrations.
 */
export const normalizeCropState = (
  crop = {},
  { minZoom = DEFAULT_CROP_ZOOM, maxZoom = DEFAULT_MAX_ZOOM } = {},
) => ({
  zoom: clamp(finiteOr(crop.zoom, minZoom), minZoom, maxZoom),
  offsetX: finiteOr(crop.offsetX, 0),
  offsetY: finiteOr(crop.offsetY, 0),
});

export const getCoverScale = ({
  imageWidth,
  imageHeight,
  viewportWidth,
  viewportHeight,
  zoom = DEFAULT_CROP_ZOOM,
}) => {
  if (
    imageWidth <= 0
    || imageHeight <= 0
    || viewportWidth <= 0
    || viewportHeight <= 0
  ) {
    return 0;
  }

  return Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight)
    * Math.max(finiteOr(zoom, DEFAULT_CROP_ZOOM), 0.01);
};

/**
 * Returns the rendered image size and safe pan bounds for a crop viewport.
 */
export const getCropMetrics = (crop = {}) => {
  const imageWidth = finiteOr(crop.imageWidth, 0);
  const imageHeight = finiteOr(crop.imageHeight, 0);
  const viewportWidth = finiteOr(crop.viewportWidth, 0);
  const viewportHeight = finiteOr(crop.viewportHeight, 0);
  const zoom = Math.max(finiteOr(crop.zoom, DEFAULT_CROP_ZOOM), 0.01);
  const scale = getCoverScale({
    imageWidth,
    imageHeight,
    viewportWidth,
    viewportHeight,
    zoom,
  });
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  const maxOffsetX = Math.max((renderedWidth - viewportWidth) / 2, 0);
  const maxOffsetY = Math.max((renderedHeight - viewportHeight) / 2, 0);

  return {
    scale,
    renderedWidth,
    renderedHeight,
    maxOffsetX,
    maxOffsetY,
    offsetX: clamp(finiteOr(crop.offsetX, 0), -maxOffsetX, maxOffsetX),
    offsetY: clamp(finiteOr(crop.offsetY, 0), -maxOffsetY, maxOffsetY),
  };
};

export const clampCropOffset = (crop = {}) => {
  const metrics = getCropMetrics(crop);
  return {
    offsetX: metrics.offsetX,
    offsetY: metrics.offsetY,
  };
};

/**
 * Maps the viewport crop back into natural image pixels for Canvas export.
 */
export const getCropAreaPixels = (crop = {}) => {
  const metrics = getCropMetrics(crop);
  if (!metrics.scale) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const imageWidth = finiteOr(crop.imageWidth, 0);
  const imageHeight = finiteOr(crop.imageHeight, 0);
  const viewportWidth = finiteOr(crop.viewportWidth, 0);
  const viewportHeight = finiteOr(crop.viewportHeight, 0);
  const left = (viewportWidth - metrics.renderedWidth) / 2 + metrics.offsetX;
  const top = (viewportHeight - metrics.renderedHeight) / 2 + metrics.offsetY;
  const x = clamp(-left / metrics.scale, 0, imageWidth);
  const y = clamp(-top / metrics.scale, 0, imageHeight);
  const width = clamp(viewportWidth / metrics.scale, 0, imageWidth - x);
  const height = clamp(viewportHeight / metrics.scale, 0, imageHeight - y);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
};

export const createObjectUrl = (source) => {
  if (!isBlobLike(source)) return typeof source === 'string' ? source : '';
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('This browser cannot create local image previews.');
  }
  return URL.createObjectURL(source);
};

export const revokeObjectUrl = (url) => {
  if (
    typeof url === 'string'
    && url.startsWith('blob:')
    && typeof URL !== 'undefined'
    && typeof URL.revokeObjectURL === 'function'
  ) {
    URL.revokeObjectURL(url);
  }
};

export const loadImage = (source, { crossOrigin = 'anonymous' } = {}) => new Promise((resolve, reject) => {
  if (typeof Image === 'undefined') {
    reject(new Error('Image cropping requires a browser environment.'));
    return;
  }

  const image = source instanceof Image ? source : new Image();
  if (!(source instanceof Image) && crossOrigin && !String(source).startsWith('blob:')) {
    image.crossOrigin = crossOrigin;
  }

  const handleLoad = () => resolve(image);
  const handleError = () => reject(new Error('The selected image could not be loaded.'));

  image.addEventListener('load', handleLoad, { once: true });
  image.addEventListener('error', handleError, { once: true });

  if (!(source instanceof Image)) {
    image.src = source;
  } else if (image.complete && image.naturalWidth > 0) {
    resolve(image);
  }
});

const resolveCropArea = (crop, profile) => {
  if (crop.areaPixels) return crop.areaPixels;
  return getCropAreaPixels({
    ...crop,
    viewportWidth: crop.viewportWidth || profile.outputWidth,
    viewportHeight: crop.viewportHeight || profile.outputHeight,
  });
};

/**
 * Exports a crop at the profile's stable dimensions. The backend still
 * validates and normalizes this untrusted browser output.
 */
export const createCroppedImageBlob = async (
  source,
  crop,
  profile = 'product',
  { mimeType = 'image/jpeg', quality = 0.92 } = {},
) => {
  const profileConfig = requireImageProfile(profile);
  const sourceUrl = createObjectUrl(source);
  const ownsObjectUrl = isBlobLike(source);

  try {
    const image = await loadImage(sourceUrl);
    const area = resolveCropArea(crop, profileConfig);
    if (!area.width || !area.height) {
      throw new Error('The crop area is not ready yet.');
    }

    if (typeof document === 'undefined') {
      throw new Error('Image cropping requires a browser environment.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = profileConfig.outputWidth;
    canvas.height = profileConfig.outputHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot render the crop preview.');

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      profileConfig.outputWidth,
      profileConfig.outputHeight,
    );

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error('The browser could not export the crop.'))),
        mimeType,
        quality,
      );
    });

    return blob;
  } finally {
    if (ownsObjectUrl) revokeObjectUrl(sourceUrl);
  }
};

export const createImageFile = (blob, fileName = 'cropped-image.jpg') => {
  if (typeof File === 'undefined') return blob;
  return new File([blob], fileName, {
    type: blob.type || 'image/jpeg',
    lastModified: Date.now(),
  });
};

export const getCroppedImageFileName = (source, profile = 'product') => {
  const profileConfig = getImageProfile(profile);
  const baseName = typeof source?.name === 'string'
    ? source.name.replace(/\.[^.]+$/, '')
    : 'image';
  return `${baseName}-${profileConfig?.key || profile}-crop.jpg`;
};

export const createCroppedImageFile = async (
  source,
  crop,
  profile = 'product',
  options,
) => {
  const blob = await createCroppedImageBlob(source, crop, profile, options);
  return createImageFile(blob, getCroppedImageFileName(source, profile));
};
