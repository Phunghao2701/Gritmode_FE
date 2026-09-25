import { Suspense } from 'react';
import LoginPage from '@/features/auth/pages/LoginPage';

export const metadata = {  description: 'Đăng nhập vào tài khoản Gritmode® của bạn.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginPage />
    </Suspense>
  );
}
