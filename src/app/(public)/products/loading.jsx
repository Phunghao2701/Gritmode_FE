/**
 * Instant Loading Skeleton for Products Listing Page (/products)
 * Displayed instantly (0ms) by Next.js App Router on navigation click.
 */
export default function ProductsLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* 1. Header & Title Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-8 sm:h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>

      {/* 2. Category Filter Pills Skeleton */}
      <div className="py-6 flex items-center gap-2 overflow-hidden">
        {[80, 100, 90, 110, 85, 95].map((width, idx) => (
          <div
            key={idx}
            style={{ width: `${width}px` }}
            className="h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0"
          />
        ))}
      </div>

      {/* 3. Product Grid Skeleton (8 items) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-3">
            {/* Image Placeholder */}
            <div className="aspect-[3/4] w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            {/* Title & Category Lines */}
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
