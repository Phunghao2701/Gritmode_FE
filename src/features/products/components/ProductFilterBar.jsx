import React from 'react';
import Icon from '../../../shared/components/Icon';

export default function ProductFilterBar({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  collections = [],
  selectedCollection = '',
  onSelectCollection,
  searchQuery = '',
  onSearchChange,
  sortBy = 'newest',
  onSortChange,
  onResetFilters,
}) {
  const activeCategoryObj = categories.find(
    (c) => String(c.category_id || c.id) === String(selectedCategory)
  );
  const activeCollectionObj = collections.find(
    (c) => String(c.collection_id || c.id) === String(selectedCollection)
  );

  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedCollection ||
    searchQuery ||
    sortBy !== 'newest'
  );

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 select-none scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('')}
          className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            !selectedCategory
              ? 'font-[550] bg-black text-white dark:bg-white dark:text-black shadow-sm'
              : 'font-normal bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
          }`}
        >
          Tất cả sản phẩm
        </button>

        {categories.map((cat) => {
          const catId = String(cat.category_id || cat.id || cat.value);
          const catName = cat.name_category || cat.name || cat.label;
          const isActive = String(selectedCategory) === catId;

          return (
            <button
              key={catId}
              type="button"
              onClick={() => onSelectCategory(catId)}
              className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'font-[550] bg-black text-white dark:bg-white dark:text-black shadow-sm'
                  : 'font-normal bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Search, Collection & Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-900">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm streetwear..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <Icon icon="solar:close-circle-bold" className="text-base" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Collection Filter */}
          {collections.length > 0 && (
            <div className="relative">
              <select
                value={selectedCollection}
                onChange={(e) => onSelectCollection(e.target.value)}
                className="appearance-none px-4 py-2.5 pr-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="">Tất cả bộ sưu tập</option>
                {collections.map((col) => (
                  <option key={col.collection_id} value={col.collection_id}>
                    {col.name_collection}
                  </option>
                ))}
              </select>
              <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs" />
            </div>
          )}

          {/* Sort Selection */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none px-4 py-2.5 pr-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="name_asc">Tên: A - Z</option>
              <option value="name_desc">Tên: Z - A</option>
            </select>
            <Icon icon="solar:alt-arrow-down-linear" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-xs" />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3.5 py-2.5 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Icon icon="solar:restart-linear" className="text-sm" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Đang lọc:</span>
          {activeCategoryObj && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px]">
              Danh mục: {activeCategoryObj.name_category}
              <button type="button" onClick={() => onSelectCategory('')} className="hover:text-rose-500 cursor-pointer">
                ×
              </button>
            </span>
          )}
          {activeCollectionObj && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px]">
              BST: {activeCollectionObj.name_collection}
              <button type="button" onClick={() => onSelectCollection('')} className="hover:text-rose-500 cursor-pointer">
                ×
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px]">
              Từ khóa: "{searchQuery}"
              <button type="button" onClick={() => onSearchChange('')} className="hover:text-rose-500 cursor-pointer">
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
