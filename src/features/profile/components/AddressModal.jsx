import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/components/Icon';
import PrimaryButton from '../../../shared/components/Button/PrimaryButton';
import InputField from '../../../shared/components/InputField';
import AddressSelectGroup from '../../../shared/components/AddressSelect/AddressSelectGroup';

export default function AddressModal({ isOpen, onClose, onSubmit, editingAddress, isLoading }) {
  const isEditing = Boolean(editingAddress);

  const [formData, setFormData] = useState({
    receiver_name_user_address: '',
    phone_user_address: '',
    province_user_address: '',
    district_user_address: '',
    ward_user_address: '',
    address_line_user_address: '',
    is_default: false,
  });

  const [errors, setErrors] = useState({});

  const handleLocationChange = (loc) => {
    setFormData((prev) => ({
      ...prev,
      province_user_address: loc.province,
      district_user_address: loc.district,
      ward_user_address: loc.ward,
    }));
    setErrors((prev) => ({
      ...prev,
      province_user_address: '',
      district_user_address: '',
      ward_user_address: '',
    }));
  };

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        receiver_name_user_address: editingAddress.receiver_name_user_address || '',
        phone_user_address: editingAddress.phone_user_address || '',
        province_user_address: editingAddress.province_user_address || '',
        district_user_address: editingAddress.district_user_address || '',
        ward_user_address: editingAddress.ward_user_address || '',
        address_line_user_address: editingAddress.address_line_user_address || '',
        is_default: Boolean(editingAddress.is_default),
      });
    } else {
      setFormData({
        receiver_name_user_address: '',
        phone_user_address: '',
        province_user_address: '',
        district_user_address: '',
        ward_user_address: '',
        address_line_user_address: '',
        is_default: false,
      });
    }
    setErrors({});
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.receiver_name_user_address.trim()) {
      newErrors.receiver_name_user_address = 'Vui lòng nhập tên người nhận';
    } else if (formData.receiver_name_user_address.trim().length < 2 || formData.receiver_name_user_address.trim().length > 100) {
      newErrors.receiver_name_user_address = 'Tên người nhận phải từ 2 đến 100 ký tự';
    }

    if (!formData.phone_user_address.trim()) {
      newErrors.phone_user_address = 'Vui lòng nhập số điện thoại';
    } else if (!/^0\d{9}$/.test(formData.phone_user_address.trim())) {
      newErrors.phone_user_address = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0';
    }

    if (!formData.address_line_user_address.trim()) {
      newErrors.address_line_user_address = 'Vui lòng nhập địa chỉ cụ thể';
    } else if (formData.address_line_user_address.trim().length < 5 || formData.address_line_user_address.trim().length > 255) {
      newErrors.address_line_user_address = 'Địa chỉ chi tiết phải từ 5 đến 255 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      receiver_name_user_address: formData.receiver_name_user_address.trim(),
      phone_user_address: formData.phone_user_address.trim(),
      address_line_user_address: formData.address_line_user_address.trim(),
      province_user_address: formData.province_user_address.trim() || null,
      district_user_address: formData.district_user_address.trim() || null,
      ward_user_address: formData.ward_user_address.trim() || null,
    };

    if (!isEditing) {
      payload.is_default = formData.is_default;
    }

    onSubmit(payload);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="font-display font-black text-xl text-black dark:text-white uppercase tracking-tight">
              {isEditing ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isEditing ? 'Cập nhật thông tin giao hàng đã lưu' : 'Điền thông tin địa chỉ giao hàng nhận sản phẩm'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Icon icon="solar:close-circle-linear" className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Họ và tên"
              name="receiver_name_user_address"
              placeholder=""
              value={formData.receiver_name_user_address}
              onChange={(e) => handleChange('receiver_name_user_address', e.target.value)}
              error={errors.receiver_name_user_address}
              icon="solar:user-linear"
              required
              className="mb-0"
            />
            <InputField
              label="Số điện thoại"
              name="phone_user_address"
              type="tel"
              placeholder=""
              value={formData.phone_user_address}
              onChange={(e) => handleChange('phone_user_address', e.target.value)}
              error={errors.phone_user_address}
              icon="solar:phone-linear"
              required
              className="mb-0"
            />
          </div>

          <AddressSelectGroup
            province={formData.province_user_address}
            district={formData.district_user_address}
            ward={formData.ward_user_address}
            onChange={handleLocationChange}
            errors={{
              province: errors.province_user_address,
              district: errors.district_user_address,
              ward: errors.ward_user_address,
            }}
            required
          />

          <InputField
            label="Địa chỉ cụ thể (Số nhà, tên đường)"
            name="address_line_user_address"
            placeholder=""
            value={formData.address_line_user_address}
            onChange={(e) => handleChange('address_line_user_address', e.target.value)}
            error={errors.address_line_user_address}
            icon="solar:map-point-linear"
            required
            className="mb-0"
          />

          {!isEditing && (
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => handleChange('is_default', e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-black accent-black cursor-pointer"
              />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Đặt làm địa chỉ nhận hàng mặc định
              </span>
            </label>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Hủy
            </button>
            <PrimaryButton
              type="submit"
              size="sm"
              isLoading={isLoading}
              className="px-6"
            >
              {isEditing ? 'Lưu cập nhật' : 'Thêm địa chỉ'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
