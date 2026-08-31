import { useTranslation } from "react-i18next";
// LoadingState.jsx
// Hiển thị khi đang gọi API verify token.
// Không có button — user chỉ cần chờ.

const LoadingState = () => {
  const {
    t
  } = useTranslation();
  return <div className="text-center py-3">
      {/* Spinner Bootstrap */}
      <div className="spinner-border mb-4" role="status" style={{
      color: 'var(--primary, #FF7A33)',
      width: '3rem',
      height: '3rem'
    }}>
        <span className="visually-hidden">{t("common.dangTai")}</span>
      </div>

      {/* Heading */}
      <h5 style={{
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      color: 'var(--text-main, #0D1B1C)',
      marginBottom: '0.5rem'
    }}>{t("auth.dangXacThucTaiKhoan")}</h5>

      {/* Mô tả */}
      <p style={{
      fontSize: '0.9rem',
      color: 'var(--text-muted, #6B6B6B)',
      marginBottom: 0
    }}>{t("auth.vuiLongChoTrongGiayLat")}</p>
    </div>;
};
export default LoadingState;