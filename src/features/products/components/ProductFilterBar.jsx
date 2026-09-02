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
}) {
  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto pb-2 select-none scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectCategory('')}
          className={`relative py-1 text-xs uppercase tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-black dark:after:bg-white after:origin-center after:transition-transform after:duration-300 ${
            !selectedCategory
              ? 'font-normal text-black dark:text-white after:scale-x-100'
              : 'font-normal text-neutral-400 hover:text-black dark:hover:text-white after:scale-x-0'
          }`}
        >
          Shop
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
              className={`relative py-1 text-xs uppercase tracking-wider transition-colors duration-300 whitespace-nowrap cursor-pointer after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-black dark:after:bg-white after:origin-center after:transition-transform after:duration-300 ${
                isActive
                  ? 'font-normal text-black dark:text-white after:scale-x-100'
                  : 'font-normal text-neutral-400 hover:text-black dark:hover:text-white after:scale-x-0'
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
                className="appearance-none px-4 py-2.5 pr-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-normal uppercase tracking-wider focus:outline-none cursor-pointer"
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
              className="appearance-none px-4 py-2.5 pr-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-normal uppercase tracking-wider focus:outline-none cursor-pointer"
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

        </div>
      </div>

    </div>
  );
}
