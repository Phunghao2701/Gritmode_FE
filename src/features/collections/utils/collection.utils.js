/**
 * Collection Domain Utilities
 * Provides sorting, active timeframe validation, and slug resolution.
 */

/**
 * Sorts collections by position_collection ASC, then start_at DESC
 * @param {Array<object>} collections
 * @returns {Array<object>}
 */
export const sortCollectionsByPosition = (collections = []) => {
  if (!Array.isArray(collections)) return [];
  return [...collections].sort((a, b) => {
    const posA = Number(a.position_collection ?? a.position ?? 0);
    const posB = Number(b.position_collection ?? b.position ?? 0);
    if (posA !== posB) return posA - posB;
    const dateA = a.start_at ? new Date(a.start_at).getTime() : 0;
    const dateB = b.start_at ? new Date(b.start_at).getTime() : 0;
    return dateB - dateA;
  });
};

/**
 * Checks if a collection is within its scheduled display timeframe
 * (Client-side helper; Backend is the primary source of truth)
 * @param {object} collection
 * @param {Date} now
 * @returns {boolean}
 */
export const isCollectionActive = (collection, now = new Date()) => {
  if (!collection) return false;
  if (collection.is_active === false) return false;
  if (collection.start_at && new Date(collection.start_at) > now) return false;
  if (collection.end_at && new Date(collection.end_at) < now) return false;
  return true;
};

/**
 * Finds a collection by ID or slug
 * @param {Array<object>} collections
 * @param {number|string} idOrSlug
 * @returns {object|null}
 */
export const findCollectionByIdOrSlug = (collections = [], idOrSlug) => {
  if (!idOrSlug || !Array.isArray(collections)) return null;
  const target = String(idOrSlug).toLowerCase();
  return (
    collections.find(
      (col) =>
        String(col.collection_id || col.id) === target ||
        (col.slug_collection || col.slug || '').toLowerCase() === target
    ) || null
  );
};
