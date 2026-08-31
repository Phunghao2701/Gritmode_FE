/**
 * Category Domain Utilities
 * Provides category tree building, flattening, hierarchical traversal, and breadcrumb generation.
 */

/**
 * Builds or sorts a hierarchical category tree from a flat list or raw categories array
 * @param {Array<object>} categories - Flat or partially nested category list
 * @returns {Array<object>} Sorted category tree
 */
export const buildCategoryTree = (categories = []) => {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  const map = new Map();
  const roots = [];

  // Clone nodes and initialize children array
  for (const cat of categories) {
    const id = Number(cat.category_id || cat.id);
    map.set(id, {
      ...cat,
      category_id: id,
      children: Array.isArray(cat.children) ? [...cat.children] : [],
    });
  }

  // Nest children under parents
  for (const cat of categories) {
    const id = Number(cat.category_id || cat.id);
    const node = map.get(id);
    const parentId = cat.parent_category_id ? Number(cat.parent_category_id) : null;

    if (parentId && map.has(parentId)) {
      const parent = map.get(parentId);
      // Avoid duplicate insertion if already in parent.children
      if (!parent.children.some((c) => Number(c.category_id || c.id) === id)) {
        parent.children.push(node);
      }
    } else if (!parentId) {
      if (!roots.some((r) => Number(r.category_id || r.id) === id)) {
        roots.push(node);
      }
    }
  }

  // Sort nodes by position_category ASC, then name_category ASC
  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      const posA = Number(a.position_category ?? a.position ?? 0);
      const posB = Number(b.position_category ?? b.position ?? 0);
      if (posA !== posB) return posA - posB;
      const nameA = a.name_category || a.name || '';
      const nameB = b.name_category || b.name || '';
      return nameA.localeCompare(nameB);
    });

    for (const node of nodes) {
      if (Array.isArray(node.children) && node.children.length > 0) {
        sortNodes(node.children);
      }
    }
  };

  sortNodes(roots);
  return roots;
};

/**
 * Flattens a category tree into a single array
 * @param {Array<object>} tree
 * @returns {Array<object>}
 */
export const flattenCategoryTree = (tree = []) => {
  const result = [];
  const traverse = (nodes) => {
    for (const node of nodes) {
      const { children, ...rest } = node;
      result.push(rest);
      if (Array.isArray(children) && children.length > 0) {
        traverse(children);
      }
    }
  };
  traverse(tree);
  return result;
};

/**
 * Finds a category in a list or tree by ID or slug
 * @param {Array<object>} categories
 * @param {number|string} idOrSlug
 * @returns {object|null}
 */
export const findCategoryByIdOrSlug = (categories = [], idOrSlug) => {
  if (!idOrSlug || !Array.isArray(categories)) return null;

  const target = String(idOrSlug).toLowerCase();

  const search = (nodes) => {
    for (const node of nodes) {
      const id = String(node.category_id || node.id);
      const slug = (node.slug_category || node.slug || '').toLowerCase();
      if (id === target || slug === target) {
        return node;
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        const found = search(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  return search(categories);
};

/**
 * Builds breadcrumb trail from root to the target category
 * @param {Array<object>} tree - Hierarchical category tree
 * @param {number|string} targetId - Category ID to find path for
 * @returns {Array<object>} Breadcrumb array of category nodes
 */
export const getCategoryBreadcrumbs = (tree = [], targetId) => {
  if (!targetId || !Array.isArray(tree)) return [];

  const target = Number(targetId);
  const path = [];

  const traverse = (nodes) => {
    for (const node of nodes) {
      const id = Number(node.category_id || node.id);
      path.push(node);
      if (id === target) return true;
      if (Array.isArray(node.children) && node.children.length > 0) {
        if (traverse(node.children)) return true;
      }
      path.pop();
    }
    return false;
  };

  traverse(tree);
  return path;
};
