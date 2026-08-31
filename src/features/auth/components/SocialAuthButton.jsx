import { useTranslation } from "react-i18next";
/**
* File source thuộc hệ thống FE ResearchPulse.
*
* File: features\auth\components\SocialAuthButton.jsx
*/
import { Button } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
export default function SocialAuthButton({
  onClick,
  disabled = false,
  label
}) {
  const {
    t
  } = useTranslation();
  const resolvedLabel = label || t("auth.tiepTucVoiGoogle");
  return <Button variant="light" onClick={onClick} disabled={disabled} className="w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 rounded-3 border transition-all text-sm font-semibold" style={{
    background: 'var(--bg-chip)',
    borderColor: 'var(--border)',
    color: 'var(--text-main)',
    boxShadow: 'none',
    transition: 'transform 0.15s ease, background 0.15s ease'
  }} onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.background = '#ffffff';
    e.currentTarget.style.borderColor = 'var(--primary)';
  }} onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.background = 'var(--bg-chip)';
    e.currentTarget.style.borderColor = 'var(--border)';
  }}>
      <Icon icon="flat-color-icons:google" width="18" />
      <span>{resolvedLabel}</span>
    </Button>;
}