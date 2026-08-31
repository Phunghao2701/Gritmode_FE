import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import Icon from '../../../shared/components/Icon';

export default function ProductGrid({
  products = [],
  isLoading = false,
  onResetFilter,
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div key={n} className="space-y-3">
            <LoadingSkeleton height="280px" className="rounded-2xl" />
            <LoadingSkeleton height="1rem" width="70%" />
            <LoadingSkeleton height="1rem" width="40%" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          title="Chưa có sản phẩm"
          description="Hiện chưa tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc tìm kiếm đã chọn."
          icon="solar:bag-smile-linear"
          actionLabel={onResetFilter ? 'Xem tất cả sản phẩm' : undefined}
          onAction={onResetFilter}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id || product.id || product._id}
            product={product}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t border-neutral-100 dark:border-neutral-800 select-none">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:border-black dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <Icon icon="solar:alt-arrow-left-linear" />
            <span>Trước</span>
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                    : 'border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:border-black dark:hover:border-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
          >
            <span>Sau</span>
            <Icon icon="solar:alt-arrow-right-linear" />
          </button>
        </div>
      )}
    </div>
  );
}
