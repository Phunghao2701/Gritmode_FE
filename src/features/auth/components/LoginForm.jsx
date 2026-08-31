import { useTranslation } from "react-i18next";
import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import InputField from '../../../shared/components/InputField';
import PasswordInput from './PasswordInput';
import CheckboxField from './CheckboxField';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';

export default function LoginForm({
  onSubmit,
  isLoading,
  apiError
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_login: false
  });
  const [errors, setErrors] = useState({});

  // Pre-fill email if remember_login was active in previous sessions
  useEffect(() => {
    const savedEmail = localStorage.getItem('researchpulse_remembered_email');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        remember_login: true
      }));
    }
  }, []);
  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'email':
        if (!value.trim()) {
          errorMsg = t("auth.emailKhongDuocDeTrong");
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMsg = t("auth.emailKhongDungDinhDang");
        }
        break;
      case 'password':
        if (!value) {
          errorMsg = t("auth.matKhauKhongDuocDeTrong");
        }
        break;
      default:
        break;
    }
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
    return !errorMsg;
  };
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    // Clear error on change
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };
  const handleBlur = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    const val = type === 'checkbox' ? checked : value;
    validateField(name, val);
  };
  const handleSubmit = e => {
    e.preventDefault();

    // Validate email & password
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    if (!emailValid || !passwordValid) return;
    onSubmit({
      email: formData.email.trim(),
      password: formData.password,
      remember_login: formData.remember_login
    });
  };
  const rememberLabel = <span className="text-xs font-semibold select-none" style={{
    color: 'var(--text-main)',
    letterSpacing: '0.01em'
  }}>{t("auth.ghiNhoDangNhap")}</span>;
  return <Form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Email Input */}
      <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nameemailcom")} error={errors.email} icon="lucide:mail" required disabled={isLoading} />

      {/* Password Input */}
      <div className="position-relative mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1.5">
          <Form.Label className="text-xs font-bold mb-0 d-flex align-items-center gap-1" style={{
          letterSpacing: '0.05em',
          color: 'var(--text-main)',
          textTransform: 'uppercase'
        }}>{t("auth.matKhau")}<span className="text-danger">*</span>
          </Form.Label>
          <a href="/forgot-password" className="text-xs font-semibold text-decoration-none" style={{
          color: 'var(--primary)',
          letterSpacing: '0.01em'
        }} onClick={e => {
          e.preventDefault();
          window.location.href = '/forgot-password';
        }}>{t("auth.quenMatKhau")}</a>
        </div>
        <PasswordInput label={null} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder={t("admin.key")} error={errors.password} required disabled={isLoading} />
      </div>

      {/* Remember Login Checkbox */}
      <CheckboxField name="remember_login" checked={formData.remember_login} onChange={handleChange} labelMarkup={rememberLabel} disabled={isLoading} />

      {/* Submit Button */}
      <SubmitButton isLoading={isLoading} loadingText="Đang đăng nhập..." label={t("signIn")} />
    </Form>;
}