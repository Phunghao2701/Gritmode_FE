function Block({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800 ${className}`}
    />
  );
}

export function AdminPageLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Đang tải trang quản trị"
      className="mx-auto max-w-7xl space-y-8"
    >
      <div className="space-y-3">
        <Block className="h-3 w-28 rounded" />
        <Block className="h-9 w-64 max-w-full rounded-lg" />
        <Block className="h-4 w-96 max-w-full rounded" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex h-28 items-center justify-between rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="space-y-3">
              <Block className="h-3 w-24 rounded" />
              <Block className="h-7 w-32 rounded-lg" />
            </div>
            <Block className="size-12 rounded-2xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-7">
          <Block className="h-6 w-48 max-w-full rounded-lg" />
          <Block className="h-4 w-64 max-w-full rounded" />
          <div className="space-y-4 pt-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Block key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </section>
        <section className="space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-5">
          <Block className="h-6 w-44 max-w-full rounded-lg" />
          <Block className="h-4 w-56 max-w-full rounded" />
          <div className="space-y-4 pt-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Block key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminLoadingSkeleton({ fullScreen = false }) {
  if (!fullScreen) return <AdminPageLoadingSkeleton />;

  return (
    <div className="flex min-h-screen bg-neutral-50 text-black dark:bg-black dark:text-white">
      <aside
        aria-hidden="true"
        className="hidden w-64 shrink-0 flex-col gap-8 bg-black p-6 lg:flex"
      >
        <div className="space-y-3 border-b border-neutral-800 pb-6">
          <Block className="h-6 w-36 bg-neutral-800" />
          <Block className="h-5 w-28 rounded bg-neutral-800" />
        </div>
        {[0, 1, 2, 3, 4].map((group) => (
          <div key={group} className="space-y-3">
            <Block className="h-3 w-24 rounded bg-neutral-800" />
            <Block className="h-10 w-full rounded-xl bg-neutral-800" />
          </div>
        ))}
        <div className="mt-auto border-t border-neutral-800 pt-5">
          <Block className="h-12 w-full rounded-xl bg-neutral-800" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          aria-hidden="true"
          className="flex min-h-16 items-center border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-black sm:px-6 lg:px-8"
        >
          <Block className="h-4 w-56 max-w-full rounded bg-neutral-200 dark:bg-neutral-800" />
        </header>
        <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
          <AdminPageLoadingSkeleton />
        </main>
        <footer
          aria-hidden="true"
          className="flex h-10 items-center border-t border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <Block className="h-3 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
        </footer>
      </div>
    </div>
  );
}
