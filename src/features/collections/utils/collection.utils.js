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

