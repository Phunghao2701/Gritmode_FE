import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState } from 'react';
import { Form } from 'react-bootstrap';
import PasswordInput from './PasswordInput';
import SubmitButton from './SubmitButton';
import FormErrorMessage from './FormErrorMessage';
export default function ResetPasswordForm({
  onSubmit,
  isLoading,
  apiError
}) {
  const { t: _t } = useTranslation();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'new_password') {
      if (!value) {
        errorMsg = t("auth.matKhauMoiKhongDuocDeTrong");
      } else if (value.length < 6) {
        errorMsg = t("auth.matKhauPhaiToiThieu6KyTu");
      }
    }
    if (name === 'confirm_password') {
      if (!value) {
        errorMsg = t("auth.xacNhanMatKhauKhongDuocDeTrong");
      } else if (value !== formData.new_password) {
        errorMsg = t("auth.matKhauXacNhanKhongKhop");
      }
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
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };
  const handleBlur = e => {
    const {
      name,
      value
    } = e.target;
    validateField(name, value);
  };
  const handleSubmit = e => {
    e.preventDefault();
    const newPassValid = validateField('new_password', formData.new_password);
    const confirmPassValid = validateField('confirm_password', formData.confirm_password);
    if (!newPassValid || !confirmPassValid) return;
    onSubmit(formData.new_password);
  };
  return <Form onSubmit={handleSubmit} noValidate>
      {/* Server API Error Banner */}
      <FormErrorMessage message={apiError} />

      {/* New Password Input */}
      <PasswordInput label={t("admin.matKhauMoi")} name="new_password" value={formData.new_password} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.toiThieu6KyTu")} error={errors.new_password} required disabled={isLoading} />

      {/* Confirm Password Input */}
      <PasswordInput label={t("auth.xacNhanMatKhauMoi")} name="confirm_password" value={formData.confirm_password} onChange={handleChange} onBlur={handleBlur} placeholder={t("auth.nhapLaiMatKhau")} error={errors.confirm_password} required disabled={isLoading} />

      {/* Submit Button */}
      <div className="mt-4">
        <SubmitButton isLoading={isLoading} loadingText="Đang cập nhật..." label={t("auth.capNhatMatKhau")} />
      </div>
    </Form>;
}