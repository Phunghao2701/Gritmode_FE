import LoadingSkeleton from '@/shared/components/LoadingSkeleton';

export default function ProductDetailLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full rounded-3xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Right: Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <LoadingSkeleton height="1.5rem" width="30%" className="rounded-lg" />
          <LoadingSkeleton height="2.5rem" width="80%" className="rounded-lg" />
          <LoadingSkeleton height="2rem" width="40%" className="rounded-lg" />
          <LoadingSkeleton height="6rem" className="rounded-2xl" />
          <LoadingSkeleton height="3.5rem" className="rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
