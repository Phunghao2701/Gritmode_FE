/**
 * Collection Domain Utilities
 * Provides sorting, active timeframe validation, and slug resolution.
 */

/**
 * Keeps older collections first and appends newly created collections.
 * @param {Array<object>} collections
 * @returns {Array<object>}
 */
export const sortCollectionsByPosition = (collections = []) => {
  if (!Array.isArray(collections)) return [];
  return [...collections].sort((a, b) => {
    const createdA = a.created_at ? new Date(a.created_at).getTime() : Number.POSITIVE_INFINITY;
    const createdB = b.created_at ? new Date(b.created_at).getTime() : Number.POSITIVE_INFINITY;
    if (createdA !== createdB) return createdA - createdB;

    const idA = Number(a.collection_id);
    const idB = Number(b.collection_id);
    if (Number.isFinite(idA) && Number.isFinite(idB) && idA !== idB) return idA - idB;

    return String(a.name_collection || '').localeCompare(String(b.name_collection || ''));
  });
};

