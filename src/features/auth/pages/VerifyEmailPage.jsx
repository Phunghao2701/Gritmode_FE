// VerifyEmailPage.jsx
// Trang xác thực email sau khi user bấm link kích hoạt.
// Dùng chung AuthLayout + AuthBanner với Register/Login để đồng bộ style.

import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import ActivationStatusCard from '../components/verify-email/ActivationStatusCard';
import SupportText from '../components/verify-email/SupportText';
import useVerifyAccount from '../hooks/useVerifyAccount';

export default function VerifyEmailPage() {
  // Lấy toàn bộ state và handler từ hook
  const {
    status,
    errorMessage,
    countdown,
    totalSeconds,
    goToLogin,
    goToHome,
    goToRegister,
  } = useVerifyAccount();

  return (
    <AuthLayout banner={<AuthBanner />}>
      {/* Card chính chứa 3 trạng thái: loading / success / error */}
      <ActivationStatusCard
        status={status}
        errorMessage={errorMessage}
        countdown={countdown}
        totalSeconds={totalSeconds}
        onLogin={goToLogin}
        onHome={goToHome}
        onRegister={goToRegister}
      />

      {/* Dòng hỗ trợ phía dưới card */}
      <SupportText />
    </AuthLayout>
  );
}