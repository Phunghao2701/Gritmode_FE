import { Suspense } from 'react';
import PaymentResultPage from '@/features/payments/pages/PaymentResultPage';


export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
      <PaymentResultPage />
    </Suspense>
  );
}
