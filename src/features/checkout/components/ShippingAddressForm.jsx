import React from 'react';
import InputField from '../../../shared/components/InputField';
import Icon from '../../../shared/components/Icon';
import AddressSelectGroup from '../../../shared/components/AddressSelect/AddressSelectGroup';

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

  const handleLocationChange = (loc) => {
    if (typeof onChange === 'function') {
      Object.entries(loc).forEach(([name, value]) => {
        onChange({ target: { name, value } });
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Saved Addresses Picker (Only for Authenticated Users with addresses) */}
      {hasSavedAddresses && (
        <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <Icon icon="solar:bookmark-opened-bold" className="text-base" />
              <span>Sổ địa chỉ của bạn</span>
            </span>
            <span className="text-[11px] text-neutral-400">Chọn để điền nhanh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? 'border-black dark:border-white bg-white dark:bg-neutral-800 shadow-md ring-1 ring-black dark:ring-white'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-xs text-black dark:text-white truncate">
                      {addr.receiver_name_user_address}
                    </span>
                    {addr.is_default && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black shrink-0">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
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
              className={`p-3.5 rounded-xl border border-dashed text-center flex items-center justify-center gap-1.5 transition-all text-xs font-bold cursor-pointer ${
                selectedAddressId === 'new'
                  ? 'border-black dark:border-white bg-white dark:bg-neutral-800 text-black dark:text-white ring-1 ring-black dark:ring-white'
                  : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon icon="solar:pen-new-square-linear" className="text-base" />
              <span>Giao tới địa chỉ khác</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Fields with Semantic Autocomplete */}
      <div className="space-y-4">
        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Họ và tên người nhận"
            name="fullName"
            autoComplete="name"
            placeholder=""
            value={formData.fullName}
            onChange={onChange}
            error={errors.fullName}
            icon="solar:user-linear"
            required
            className="mb-0"
          />
          <InputField
            label="Số điện thoại"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder=""
            value={formData.phone}
            onChange={onChange}
            error={errors.phone}
            icon="solar:phone-linear"
            required
            className="mb-0"
          />
        </div>

        {/* Email */}
        <InputField
          label="Địa chỉ Email nhận thông tin đơn hàng"
          name="email"
          type="email"
          autoComplete="email"
          placeholder=""
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          icon="solar:letter-linear"
          required
          className="mb-0"
        />

        {/* Province / District / Ward */}
        <AddressSelectGroup
          province={formData.province}
          district={formData.district}
          ward={formData.ward}
          onChange={handleLocationChange}
          errors={errors}
          required
        />

        {/* Street Address */}
        <InputField
          label="Địa chỉ cụ thể (Số nhà, tên đường)"
          name="street"
          autoComplete="street-address"
          placeholder=""
          value={formData.street}
          onChange={onChange}
          error={errors.street}
          icon="solar:map-point-linear"
          required
          className="mb-0"
        />

        {/* Order Note */}
        <div className="space-y-1.5 pt-1">
          <label htmlFor="checkout-note" className="block text-xs font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
            Ghi chú đơn hàng (Tùy chọn)
          </label>
          <textarea
            id="checkout-note"
            name="note"
            rows={2}
            placeholder=""
            value={formData.note || ''}
            onChange={onChange}
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
