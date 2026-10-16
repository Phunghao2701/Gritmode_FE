/**
 * The browser projection of the shared media profile contract.
 *
 * Keep profile names stable: they are sent back to the API during finalize.
 */
export const IMAGE_PROFILES = Object.freeze({
  product: Object.freeze({
    key: 'product',
    label: 'Product image',
    widthRatio: 3,
    heightRatio: 4,
    ratio: 3 / 4,
    aspectRatio: '3 / 4',
    outputWidth: 1200,
    outputHeight: 1600,
    minZoom: 1,
    maxZoom: 3.5,
    zoomStep: 0.05,
  }),
  collection: Object.freeze({
    key: 'collection',
    label: 'Collection image',
    widthRatio: 4,
    heightRatio: 3,
    ratio: 4 / 3,
    aspectRatio: '4 / 3',
    outputWidth: 1600,
    outputHeight: 1200,
    minZoom: 1,
    maxZoom: 3.5,
    zoomStep: 0.05,
  }),
  banner: Object.freeze({
    key: 'banner',
    label: 'Banner image',
    widthRatio: 16,
    heightRatio: 9,
    ratio: 16 / 9,
    aspectRatio: '16 / 9',
    outputWidth: 1920,
    outputHeight: 1080,
    minZoom: 1,
    maxZoom: 3.5,
    zoomStep: 0.05,
  }),
});

export const DEFAULT_IMAGE_PROFILE = 'product';
export const IMAGE_PROFILE_KEYS = Object.freeze(Object.keys(IMAGE_PROFILES));

export const getImageProfile = (profile = DEFAULT_IMAGE_PROFILE) => {
  const profileKey = typeof profile === 'string' ? profile : profile?.key;
  return IMAGE_PROFILES[profileKey] || null;
};

export const isImageProfile = (profile) => Boolean(getImageProfile(profile));

export const requireImageProfile = (profile = DEFAULT_IMAGE_PROFILE) => {
  const resolved = getImageProfile(profile);
  if (!resolved) {
    throw new Error(`Unknown image profile: ${String(profile)}`);
  }
  return resolved;
};
