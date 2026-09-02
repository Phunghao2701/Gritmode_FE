import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import PaginationControls from '../../../shared/components/PaginationControls';

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div key={n} className="space-y-3">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse" />
            <LoadingSkeleton height="1rem" width="75%" className="rounded-lg" />
            <LoadingSkeleton height="1rem" width="45%" className="rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          title="Chưa có sản phẩm phù hợp"
          description="Hiện chưa tìm thấy sản phẩm nào phù hợp với bộ lọc hoặc tìm kiếm đã chọn. Hãy thử xóa bộ lọc để xem toàn bộ danh mục."
          icon="solar:bag-smile-linear"
          actionLabel={onResetFilter ? 'Xem tất cả sản phẩm' : undefined}
          onAction={onResetFilter}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 animate-fade-in">
        {products.map((product) => (
          <ProductCard
            key={product.product_id || product.id || product._id}
            product={product}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center pt-8 border-t border-neutral-100 dark:border-neutral-900 select-none">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

