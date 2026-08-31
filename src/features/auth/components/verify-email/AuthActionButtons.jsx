import { useTranslation } from "react-i18next";
// AuthActionButtons.jsx
// Nhóm các button hành động — tách riêng để dễ thay đổi layout button.
// Nhận props để biết đang ở state success hay error.

const AuthActionButtons = ({
  status,
  onLogin,
  onHome,
  onRegister
}) => {
  const {
    t
  } = useTranslation();
  // ─── Buttons cho trạng thái SUCCESS ───────────────────────────────────────
  if (status === 'success') {
    return <div className="d-grid gap-2">
        {/* Button chính — đi thẳng đến login không chờ countdown */}
        <button onClick={onLogin} className="btn" style={{
        backgroundColor: 'var(--primary, #FF7A33)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.65rem 1rem',
        fontWeight: 600,
        fontSize: '0.95rem'
      }}>{t("article.dangNhapNgay")}</button>

        {/* Link phụ — về trang chủ */}
        <button onClick={onHome} className="btn btn-link" style={{
        color: 'var(--text-muted, #6B6B6B)',
        textDecoration: 'none',
        fontSize: '0.9rem'
      }}>{t("auth.veTrangChu")}</button>
      </div>;
  }

  // ─── Buttons cho trạng thái ERROR ─────────────────────────────────────────
  if (status === 'error') {
    return <div className="d-grid gap-2">
        {/* Button chính — đăng ký lại */}
        <button onClick={onRegister} className="btn" style={{
        backgroundColor: 'var(--primary)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '0.65rem 1rem',
        fontWeight: 600,
        fontSize: '0.95rem'
      }}>{t("auth.dangKyLai")}</button>

        {/* Link phụ — về trang đăng nhập */}
        <button onClick={onLogin} className="btn btn-link" style={{
        color: 'var(--text-muted, #6B6B6B)',
        textDecoration: 'none',
        fontSize: '0.9rem'
      }}>{t("auth.veTrangDangNhap")}</button>
      </div>;
  }

  // Loading state — không hiển thị button
  return null;
};
export default AuthActionButtons;