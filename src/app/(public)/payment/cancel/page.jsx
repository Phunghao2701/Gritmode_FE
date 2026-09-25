'use client';

import { Suspense } from 'react';
import PaymentResultPage from '@/features/payments/pages/PaymentResultPage';

export default function PaymentCancelRoute() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-sm text-neutral-400">Đang tải thông tin giao dịch...</div>}>
      <PaymentResultPage />
    </Suspense>
  );
}
