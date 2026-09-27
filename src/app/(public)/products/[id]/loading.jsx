/**
 * Instant Loading Skeleton for Product Detail Page (/products/[id])
 * Displayed instantly (0ms) by Next.js App Router on navigation click.
 */
export default function ProductDetailLoading() {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Images Skeleton (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full rounded-3xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right: Product Info & Purchase Panel Skeleton (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-8 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-6 w-36 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-2" />
          </div>

          <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-6 space-y-4">
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="flex gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-14 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-12 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
