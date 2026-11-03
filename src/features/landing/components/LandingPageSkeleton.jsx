export default function LandingPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Đang tải cửa hàng" className="space-y-16 sm:space-y-24 pb-24 -mt-20">
      <section className="min-h-[75vh] sm:min-h-[92vh] bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="h-9 w-56 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          <div className="hidden sm:flex gap-5">
            <div className="h-5 w-14 rounded bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
            <div className="h-5 w-14 rounded bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[3/4] w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              <div className="min-h-[5rem] space-y-2 px-1">
                <div className="h-3 w-3/4 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
                <div className="h-4 w-1/2 rounded-lg bg-neutral-100 dark:bg-neutral-900 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
