'use client';

import { Suspense } from 'react';
import ProductListPage from '@/features/products/pages/ProductListPage';

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm text-neutral-400">Đang tải bộ sưu tập...</div>}>
      <ProductListPage />
    </Suspense>
  );
}
