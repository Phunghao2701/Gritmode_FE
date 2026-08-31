import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import ROUTES from '../../../app/routes/routePaths';
export default function ForgotPasswordSuccess({
  onResend,
  isLoading
}) {
  const {
    t
  } = useTranslation();
  const [countdown, setCountdown] = useState(60);
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);
  const handleResendClick = () => {
    if (countdown > 0 || isLoading) return;
    onResend();
    setCountdown(60); // Reset timer
  };
  return <div className="text-center py-4 animate-fade-in">
      <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{
      width: '4.5rem',
      height: '4.5rem',
      backgroundColor: 'var(--primary-light)',
      color: 'var(--primary)'
    }}>
        <Icon icon="lucide:check-circle" width="40" height="40" />
      </div>

      <h3 className="font-display fw-bold mb-3 text-main" style={{
      fontSize: '1.75rem'
    }}>{t("auth.kiemTraEmailCuaBan")}</h3>
      
      <p className="text-muted-custom text-sm mb-4 leading-relaxed" style={{
      lineHeight: 1.6
    }}>{t("auth.neuEmailTonTaiTrongHeThongLien")}</p>

      {/* Actions */}
      <div className="d-flex flex-column gap-3">
        <Button variant="link" onClick={handleResendClick} disabled={countdown > 0 || isLoading} className="text-decoration-none text-sm font-semibold p-0 border-0" style={{
        color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)',
        cursor: countdown > 0 ? 'not-allowed' : 'pointer'
      }}>
          {countdown > 0 ? `Gửi lại email (${countdown}s)` : t("auth.guiLaiEmail")}
        </Button>

        <div className="w-100" style={{
        height: '1px',
        background: 'var(--border)'
      }} />

        <Link to={ROUTES.LOGIN} className="text-decoration-none text-sm font-semibold py-2" style={{
        color: 'var(--btn-dark)'
      }}>{t("auth.quayLaiDangNhap")}</Link>
      </div>
    </div>;
}