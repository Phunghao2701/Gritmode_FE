import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import ForgotPasswordSuccess from '../components/ForgotPasswordSuccess';
import { forgotPasswordApi } from '../api/auth.api';
import Icon from '../../../shared/components/Icon';
export default function ForgotPasswordPage() {
  const { t: _t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const handleForgotPasswordSubmit = async email => {
    setIsLoading(true);
    setError(null);
    try {
      setSubmittedEmail(email);
      await forgotPasswordApi(email);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Forgot password API failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || err.message || t("auth.guiYeuCauKhoiPhucMatKhauThatBa"));
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendEmail = async () => {
    if (!submittedEmail) return;
    setIsLoading(true);
    setError(null);
    try {
      await forgotPasswordApi(submittedEmail);
    } catch (err) {
      console.error('Resending forgot password failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || t("auth.guiLaiYeuCauKhoiPhucThatBai"));
    } finally {
      setIsLoading(false);
    }
  };
  return <AuthLayout banner={<AuthBanner />}>
      {!isSubmitted ? <>
          {/* Logo on mobile only */}
          <div className="d-flex d-md-none align-items-center gap-2 mb-4">
            <div className="d-flex align-items-center justify-content-center" style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'var(--btn-dark)',
          boxShadow: '0 4px 10px rgba(7, 26, 28, 0.15)'
        }}>
              <Icon icon="lucide:activity" className="text-white text-sm" />
            </div>
            <span className="fs-5 fw-bold font-display" style={{
          letterSpacing: '0.03em',
          color: 'var(--text-main)'
        }}>
              ResearchPulse
            </span>
          </div>

          <div className="mb-4">
            <h2 className="font-display fw-bold mb-1" style={{
          fontSize: '1.85rem',
          color: 'var(--text-main)'
        }}>{t("auth.quenMatKhau")}</h2>
            <p className="text-muted-custom text-sm mb-0" style={{
          color: 'var(--text-muted)'
        }}>{t("auth.nhapEmailTaiKhoanCuaBanNeuEmai")}</p>
          </div>

          <ForgotPasswordForm onSubmit={handleForgotPasswordSubmit} isLoading={isLoading} apiError={error} />
        </> : <ForgotPasswordSuccess onResend={handleResendEmail} isLoading={isLoading} />}
    </AuthLayout>;
}