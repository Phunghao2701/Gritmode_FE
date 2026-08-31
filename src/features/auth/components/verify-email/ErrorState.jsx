import { useTranslation } from "react-i18next";
// ErrorState.jsx
// Hiển thị khi token không hợp lệ, hết hạn, hoặc không có token trên URL.
// Không tự redirect — user tự chọn hành động tiếp theo.

import ErrorIcon from './ErrorIcon';
import AuthActionButtons from './AuthActionButtons';
const ErrorState = ({
  message,
  onLogin,
  onRegister
}) => {
  const {
    t
  } = useTranslation();
  return <div>
      {/* Icon cảnh báo màu cam */}
      <ErrorIcon />

      {/* Heading */}
      <h4 className="text-center mb-2" style={{
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: 'var(--text-main, #0D1B1C)'
    }}>{t("auth.kichHoatTaiKhoanThatBai")}</h4>

      {/* Message lỗi — từ BE hoặc default */}
      <p className="text-center mb-4" style={{
      fontSize: '0.93rem',
      color: 'var(--text-muted, #6B6B6B)',
      lineHeight: 1.6
    }}>
        {message || t("auth.lienKetKichHoatKhongHopLeHoacD")}
      </p>

      {/* Buttons */}
      <AuthActionButtons status="error" onLogin={onLogin} onRegister={onRegister} />
    </div>;
};
export default ErrorState;