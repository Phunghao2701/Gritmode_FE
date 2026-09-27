/**
 * Instant Local Skeleton for Products Listing Page (/products)
 * Keeps Breadcrumbs, Title, and Category Tabs static (zero layout shift)
 * Confines pulse animation strictly to the Product Cards Grid.
 */
export default function ProductsLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[70vh] animate-fade-in">
      {/* 1. Static Breadcrumb Navigation (Exact match with ProductListPage) */}
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 select-none">
        <span className="font-normal">Trang chủ</span>
        <span>/</span>
        <span className="text-black dark:text-white font-[550]">Shop</span>
      </div>

      {/* 2. Static Header Banner */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white uppercase tracking-widest mt-1">
            Shop
          </h1>
        </div>
      </div>

      {/* 3. Static Category Filter Tabs Shell */}
      <div className="space-y-4">
        <div className="flex items-center gap-6 overflow-x-auto pb-2 select-none scrollbar-none">
          <span className="relative py-1 text-xs uppercase tracking-wider font-normal text-black dark:text-white after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-black dark:after:bg-white">
            Shop
          </span>
          {['Áo', 'Quần', 'Phụ kiện', 'Bộ sưu tập'].map((tab, idx) => (
            <span key={idx} className="py-1 text-xs uppercase tracking-wider font-normal text-neutral-400 select-none">
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Local Product Grid Skeleton (Only this section pulses) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-3">
            {/* Card Image Placeholder */}
            <div className="aspect-[3/4] w-full rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            {/* Card Metadata Lines */}
            <div className="space-y-2 px-1">
              <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
