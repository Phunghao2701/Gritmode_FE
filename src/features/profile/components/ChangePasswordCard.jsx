import React, { useState } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import { useChangePassword } from '../hooks/useProfile';

export default function ChangePasswordCard() {
  const { changePassword, isChangingPassword } = useChangePassword();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu mới';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    changePassword(
      {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      {
        onSuccess: () => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        },
      }
    );
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 animate-fade-in">
      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h3 className="font-display font-black text-xl text-black dark:text-white uppercase tracking-tight">
          Bảo mật & Đổi mật khẩu
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          Để bảo vệ tài khoản của bạn, vui lòng không chia sẻ mật khẩu cho bất kỳ ai khác
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder=""
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-11 rounded-xl border text-xs font-medium bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white focus:outline-none transition-colors ${
                errors.currentPassword
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white p-1 text-base cursor-pointer"
            >
              <Icon icon={showCurrentPassword ? 'solar:eye-bold' : 'solar:eye-closed-linear'} />
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
              <Icon icon="solar:danger-triangle-linear" />
              <span>{errors.currentPassword}</span>
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder=""
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-11 rounded-xl border text-xs font-medium bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white focus:outline-none transition-colors ${
                errors.newPassword
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white p-1 text-base cursor-pointer"
            >
              <Icon icon={showNewPassword ? 'solar:eye-bold' : 'solar:eye-closed-linear'} />
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
              <Icon icon="solar:danger-triangle-linear" />
              <span>{errors.newPassword}</span>
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder=""
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-11 rounded-xl border text-xs font-medium bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white focus:outline-none transition-colors ${
                errors.confirmPassword
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white p-1 text-base cursor-pointer"
            >
              <Icon icon={showConfirmPassword ? 'solar:eye-bold' : 'solar:eye-closed-linear'} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
              <Icon icon="solar:danger-triangle-linear" />
              <span>{errors.confirmPassword}</span>
            </p>
          )}
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            * Mật khẩu an toàn nên kết hợp cả chữ hoa, chữ thường và số để tăng cường khả năng bảo mật.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <PrimaryButton
            type="submit"
            isLoading={isChangingPassword}
            size="sm"
            className="px-6"
          >
            Đổi mật khẩu
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
