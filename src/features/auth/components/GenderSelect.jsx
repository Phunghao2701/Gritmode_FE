import { useTranslation } from "react-i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\GenderSelect.jsx
 */
import { Form } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
export default function GenderSelect({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  disabled = false
}) {
  const {
    t
  } = useTranslation();
  const handleSelect = val => {
    if (disabled) return;
    onChange({
      target: {
        name,
        value: val
      }
    });
  };
  return <Form.Group className="mb-3">
      {label && <Form.Label className="text-xs font-bold mb-1.5 d-flex align-items-center gap-1" style={{
      letterSpacing: '0.05em',
      color: 'var(--text-main)',
      textTransform: 'uppercase'
    }}>
          {label}
          {required && <span className="text-danger">*</span>}
        </Form.Label>}

      <div className="p-1 rounded-3 d-flex align-items-center" style={{
      background: 'var(--bg-chip)',
      border: '1px solid var(--border)',
      width: '100%',
      height: '44px'
    }}>
        {/* Option: Male */}
        <div onClick={() => handleSelect(true)} className={`gender-option ${value === true ? 'selected' : ''} ${disabled ? 'disabled' : ''} flex-fill h-100 d-flex align-items-center justify-content-center gap-2 rounded-2 select-none`} style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: value === true ? '#ffffff' : 'transparent',
        color: value === true ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: value === true ? '600' : '500',
        fontSize: '14px',
        border: '1px solid transparent',
        opacity: disabled ? 0.6 : 1
      }}>
          <Icon icon="lucide:check-circle" width="16" style={{
          opacity: value === true ? 1 : 0,
          transition: 'opacity 0.2s'
        }} />
          <span>{t("auth.nam")}</span>
        </div>

        {/* Option: Female */}
        <div onClick={() => handleSelect(false)} className={`gender-option ${value === false ? 'selected' : ''} ${disabled ? 'disabled' : ''} flex-fill h-100 d-flex align-items-center justify-content-center gap-2 rounded-2 select-none`} style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: value === false ? '#ffffff' : 'transparent',
        color: value === false ? 'var(--primary)' : 'var(--text-muted)',
        fontWeight: value === false ? '600' : '500',
        fontSize: '14px',
        border: '1px solid transparent',
        opacity: disabled ? 0.6 : 1
      }}>
          <Icon icon="lucide:check-circle" width="16" style={{
          opacity: value === false ? 1 : 0,
          transition: 'opacity 0.2s'
        }} />
          <span>{t("auth.nu")}</span>
        </div>
      </div>

      {error && <div className="text-danger text-xs mt-1.5 d-flex align-items-center gap-1 animate-fade-in" style={{
      fontWeight: 500
    }}>
          <Icon icon="lucide:alert-circle" width="12" />
          <span>{error}</span>
        </div>}

      {/* Dynamic hover and active selection styling */}
      <style>{`
        .gender-option {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gender-option:hover:not(.disabled):not(.selected) {
          background-color: rgba(255, 122, 51, 0.05) !important;
          color: var(--primary) !important;
        }
        .gender-option.selected {
          box-shadow: 0 2px 6px rgba(255, 122, 51, 0.12) !important;
          border-color: rgba(255, 122, 51, 0.15) !important;
        }
      `}</style>
    </Form.Group>;
}