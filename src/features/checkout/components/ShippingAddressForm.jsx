import React from 'react';
import InputField from '../../../shared/components/InputField';
import Icon from '../../../shared/components/Icon';

export default function ShippingAddressForm({
  formData,
  onChange,
  errors = {},
  addresses = [],
  onSelectSavedAddress,
  selectedAddressId,
  isAuthenticated,
}) {
  const hasSavedAddresses = isAuthenticated && addresses.length > 0;

  return (
    <div className="space-y-5">
      {/* Saved Addresses Picker (Only for Authenticated Users with addresses) */}
      {hasSavedAddresses && (
        <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <Icon icon="solar:bookmark-opened-bold" />
              <span>Sổ địa chỉ của bạn</span>
            </span>
            <span className="text-[11px] text-neutral-400">Chọn để điền nhanh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.user_address_id;
              const fullAddr = [
                addr.address_line_user_address,
                addr.ward_user_address,
                addr.district_user_address,
                addr.province_user_address,
              ]
                .filter(Boolean)
                .join(', ');

              return (
                <button
                  key={addr.user_address_id}
                  type="button"
                  onClick={() => onSelectSavedAddress?.(addr)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-1.5 cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-white dark:bg-neutral-800 shadow-sm'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-black dark:text-white truncate">
                      {addr.receiver_name_user_address}
                    </span>
                    {addr.is_default && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                    {fullAddr}
                  </p>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {addr.phone_user_address}
                  </span>
                </button>
              );
            })}

            {/* Option to type custom address */}
            <button
              type="button"
              onClick={() => onSelectSavedAddress?.(null)}
              className={`p-3 rounded-xl border border-dashed text-center flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                selectedAddressId === 'new'
                  ? 'border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-neutral-400'
              }`}
            >
              <Icon icon="solar:pen-new-square-linear" />
              <span>Giao tới địa chỉ khác</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Họ và tên người nhận *"
          name="fullName"
          placeholder="Nguyễn Văn A"
          value={formData.fullName}
          onChange={onChange}
          error={errors.fullName}
          icon="solar:user-linear"
          required
        />
        <InputField
          label="Số điện thoại *"
          name="phone"
          placeholder="0912345678"
          value={formData.phone}
          onChange={onChange}
          error={errors.phone}
          icon="solar:phone-linear"
          required
        />
      </div>

      <InputField
        label="Email nhận thông tin đơn hàng *"
        name="email"
        type="email"
        placeholder="email@example.com"
        value={formData.email}
        onChange={onChange}
        error={errors.email}
        icon="solar:letter-linear"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InputField
          label="Tỉnh / Thành phố *"
          name="province"
          placeholder="TP. Hồ Chí Minh"
          value={formData.province}
          onChange={onChange}
          error={errors.province}
          required
        />
        <InputField
          label="Quận / Huyện *"
          name="district"
          placeholder="Quận 1"
          value={formData.district}
          onChange={onChange}
          error={errors.district}
          required
        />
        <InputField
          label="Phường / Xã *"
          name="ward"
          placeholder="Phường Bến Nghé"
          value={formData.ward}
          onChange={onChange}
          error={errors.ward}
          required
        />
      </div>

      <InputField
        label="Địa chỉ cụ thể (Số nhà, tên đường) *"
        name="street"
        placeholder="Số 123 đường Nguyễn Huệ..."
        value={formData.street}
        onChange={onChange}
        error={errors.street}
        icon="solar:map-point-linear"
        required
      />

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Ghi chú đơn hàng (Tùy chọn)
        </label>
        <textarea
          name="note"
          rows={2}
          placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
          value={formData.note || ''}
          onChange={onChange}
          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
        />
      </div>
    </div>
  );
}
