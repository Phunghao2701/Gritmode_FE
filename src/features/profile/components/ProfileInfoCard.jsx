import React, { useState, useEffect } from 'react';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import Icon from '../../../shared/components/Icon';

export default function ProfileInfoCard({ profile, onUpdateProfile, isUpdating }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'null', // 'true' | 'false' | 'null'
    url_image: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.substring(0, 10) : '',
        gender: profile.gender === true ? 'true' : profile.gender === false ? 'false' : 'null',
        url_image: profile.url_image || '',
      });
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.full_name.trim() && (formData.full_name.trim().length < 2 || formData.full_name.trim().length > 100)) {
      newErrors.full_name = 'Họ và tên phải từ 2 đến 100 ký tự';
    }

    if (formData.phone.trim() && !/^0\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0';
    }

    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        newErrors.date_of_birth = 'Ngày sinh không hợp lệ hoặc lớn hơn ngày hiện tại';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {};
    if (formData.full_name.trim()) {
      payload.full_name = formData.full_name.trim();
    }
    if (formData.phone.trim()) {
      payload.phone = formData.phone.trim();
    }
    if (formData.date_of_birth) {
      payload.date_of_birth = formData.date_of_birth;
    } else {
      payload.date_of_birth = null;
    }

    if (formData.gender === 'true') {
      payload.gender = true;
    } else if (formData.gender === 'false') {
      payload.gender = false;
    } else {
      payload.gender = null;
    }

    onUpdateProfile(payload);
  };

  const initials = (formData.full_name || formData.email || 'G')
    .trim()
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-4">
          {/* Avatar Monogram */}
          <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-display font-black text-xl shadow-md shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl text-black dark:text-white uppercase tracking-tight">
                {formData.full_name || 'Khách hàng Gritmode'}
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-full">
                Thành viên
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cập nhật thông tin định danh và hồ sơ cá nhân của bạn
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Họ và tên"
            name="full_name"
            placeholder=""
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            error={errors.full_name}
            icon="solar:user-linear"
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            type="tel"
            placeholder=""
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            icon="solar:phone-linear"
          />
        </div>

        {/* Email Readonly */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
            Địa chỉ Email (Đã xác thực OTP)
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/60 text-xs font-medium text-neutral-500 cursor-not-allowed"
            />
            <span className="absolute right-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
              <Icon icon="solar:verified-check-bold" />
              <span>Đã xác thực</span>
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Email được sử dụng để đăng nhập không cần mật khẩu (Passwordless OTP).
          </p>
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Ngày sinh"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            error={errors.date_of_birth}
            icon="solar:calendar-linear"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Giới tính
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Nam', val: 'true', icon: 'solar:men-bold' },
                { label: 'Nữ', val: 'false', icon: 'solar:women-bold' },
                { label: 'Khác', val: 'null', icon: 'solar:users-group-two-rounded-linear' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleChange('gender', item.val)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    formData.gender === item.val
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                  }`}
                >
                  <Icon icon={item.icon} className="text-sm" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <PrimaryButton
            type="submit"
            isLoading={isUpdating}
            size="sm"
            className="px-6"
          >
            Lưu thay đổi hồ sơ
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
