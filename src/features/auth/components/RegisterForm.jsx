import { useTranslation } from "react-i18next";
import { t } from "i18next";
/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\auth\components\RegisterForm.jsx
 */
import { useState } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import InputField from '../../../shared/components/InputField';
import PasswordInput from './PasswordInput';
import DateInput from './DateInput';
import GenderSelect from './GenderSelect';
import RoleSelect from './RoleSelect';
import CheckboxField from './CheckboxField';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';
export default function RegisterForm({
  onSubmit,
  isLoading,
  apiError
}) {
  const { t: _t } = useTranslation();
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    email: '',
    password: '',
    date_of_birth: '',
    gender: true,
    // Default to true (Nam)
    role: 'STUDENT',
    // Default to STUDENT
    terms: false
  });
  const [errors, setErrors] = useState({});
  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'last_name':
        if (!value.trim()) {
          errorMsg = t("auth.hoKhongDuocDeTrong");
        }
        break;
      case 'first_name':
        if (!value.trim()) {
          errorMsg = t("auth.tenKhongDuocDeTrong");
        }
        break;
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
        } else if (value.length < 8) {
          errorMsg = t("auth.matKhauPhaiToiThieu8KyTu");
        }
        break;
      case 'date_of_birth':
        if (!value) {
          errorMsg = t("auth.ngaySinhKhongDuocDeTrong");
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          if (selectedDate > today) {
            errorMsg = t("auth.ngaySinhKhongDuocTrongTuongLai");
          }
        }
        break;
      case 'terms':
        if (!value) {
          errorMsg = t("auth.banPhaiDongYVoiDieuKhoanDeTiep");
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

    // Validate all fields
    const fieldsToValidate = ['last_name', 'first_name', 'email', 'password', 'date_of_birth', 'terms'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      const fieldValid = validateField(field, formData[field]);
      if (!fieldValid) {
        isValid = false;
      }
    });
    if (!isValid) return;

    // Build payload for API (exclude terms)
    const payload = {
      ...formData
    };
    delete payload.terms;
    onSubmit({
      ...payload,
      last_name: payload.last_name.trim(),
      first_name: payload.first_name.trim()
    });
  };
  const termsLabel = <span>{t("auth.toiDongYVoi")}{' '}
      <a href="#" className="text-decoration-none" style={{
      color: 'var(--primary)',
      fontWeight: 500
    }} onClick={e => e.preventDefault()}>{t("auth.dieuKhoanDichVu")}</a>{' '}{t("article.va")}{' '}
      <a href="#" className="text-decoration-none" style={{
      color: 'var(--primary)',
      fontWeight: 500
    }} onClick={e => e.preventDefault()}>{t("auth.chinhSachBaoMat")}</a>
    </span>;
  return <Form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* Row: Last Name & First Name (Stacked on mobile, side-by-side on tablet/desktop) */}
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <InputField label={t("auth.ho", "Last Name")} name="last_name" value={formData.last_name} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nguyen")} error={errors.last_name} required disabled={isLoading} />
        </Col>
        <Col xs={12} sm={6}>
          <InputField label={t("auth.ten", "First Name")} name="first_name" value={formData.first_name} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.vanA")} error={errors.first_name} required disabled={isLoading} />
        </Col>
      </Row>

      {/* Email */}
      <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nameemailcom")} error={errors.email} icon="lucide:mail" required disabled={isLoading} />

      {/* Password */}
      <PasswordInput label={t("auth.matKhau")} name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.toiThieu8KyTu")} error={errors.password} required disabled={isLoading} />

      {/* Row: Date of Birth & Gender (Stacked on mobile, side-by-side on tablet/desktop) */}
      <Row className="g-3">
        <Col xs={12} sm={6}>
          <DateInput label={t("auth.ngaySinh")} name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} onBlur={handleBlur} error={errors.date_of_birth} required disabled={isLoading} />
        </Col>
        <Col xs={12} sm={6}>
          <GenderSelect label={t("auth.gioiTinh")} name="gender" value={formData.gender} onChange={handleChange} error={errors.gender} required disabled={isLoading} />
        </Col>
      </Row>

      {/* Role Selector */}
      <RoleSelect label={t("auth.vaiTro")} name="role" value={formData.role} onChange={handleChange} error={errors.role} required disabled={isLoading} />

      {/* Terms Checkbox */}
      <CheckboxField name="terms" checked={formData.terms} onChange={handleChange} error={errors.terms} labelMarkup={termsLabel} disabled={isLoading} />

      {/* Submit Button */}
      <SubmitButton isLoading={isLoading} loadingText="Đang tạo tài khoản..." label={t("auth.taoTaiKhoan")} />

      {/* Link Redirect to Login */}
      <div className="text-center mt-4 text-sm font-medium">
        <span className="text-muted-custom" style={{
        color: '#94a3b8 !important'
      }}>{t("auth.daCoTaiKhoan")}</span>
        <Link to={ROUTES.LOGIN} className="text-decoration-none" style={{
        color: 'var(--primary)',
        fontWeight: 600
      }}>{t("signIn")}</Link>
      </div>
    </Form>;
}