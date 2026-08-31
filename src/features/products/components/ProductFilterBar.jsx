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
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  onResetFilters,
}) {
  const hasActiveFilters = Boolean(
    selectedCategory ||
    selectedCollection ||
    searchQuery ||
    minPrice ||
    maxPrice ||
    sortBy !== 'newest'
  );

  return (
    <div className="space-y-4">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 select-none scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
            !selectedCategory
              ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
              : 'bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
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
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm font-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {/* Search, Collection, Price & Sort Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-neutral-100 dark:border-neutral-900">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Icon icon="solar:magnifer-linear" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-base" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Collection Filter */}
          {collections.length > 0 && (
            <select
              value={selectedCollection}
              onChange={(e) => onSelectCollection(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả bộ sưu tập</option>
              {collections.map((col) => (
                <option key={col.collection_id} value={col.collection_id}>
                  {col.name_collection}
                </option>
              ))}
            </select>
          )}

          {/* Sort Selection */}
          <div className="flex items-center gap-1.5 font-bold text-neutral-500">
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="name_asc">Tên: A - Z</option>
              <option value="name_desc">Tên: Z - A</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 underline cursor-pointer flex items-center gap-1"
            >
              <Icon icon="solar:restart-linear" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
