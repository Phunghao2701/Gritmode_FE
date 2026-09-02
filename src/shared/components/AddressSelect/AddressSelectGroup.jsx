import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../Icon';
import {
  loadVietnamAddressTree,
  getInitialProvincesList,
  findProvinceObject,
  findDistrictObject,
} from '../../utils/vietnamAddress';

export default function AddressSelectGroup({
  province = '',
  district = '',
  ward = '',
  onChange,
  errors = {},
  required = true,
  disabled = false,
  className = '',
}) {
  const [addressTree, setAddressTree] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    loadVietnamAddressTree().then((tree) => {
      if (isMounted) setAddressTree(tree);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute matched province object
  const currentProvinceObj = useMemo(() => {
    return findProvinceObject(addressTree, province);
  }, [addressTree, province]);

  // Compute matched district object
  const currentDistrictObj = useMemo(() => {
    return findDistrictObject(currentProvinceObj, district);
  }, [currentProvinceObj, district]);

  // Options list
  const provinceOptions = useMemo(() => {
    if (addressTree.length > 0) {
      return addressTree.map((p) => p.name);
    }
    return getInitialProvincesList();
  }, [addressTree]);

  const districtOptions = useMemo(() => {
    if (currentProvinceObj && Array.isArray(currentProvinceObj.districts)) {
      return currentProvinceObj.districts.map((d) => d.name);
    }
    return [];
  }, [currentProvinceObj]);

  const wardOptions = useMemo(() => {
    if (currentDistrictObj && Array.isArray(currentDistrictObj.wards)) {
      return currentDistrictObj.wards.map((w) => w.name);
    }
    return [];
  }, [currentDistrictObj]);

  const handleProvinceChange = (e) => {
    const newProvince = e.target.value;
    if (onChange) {
      onChange({
        province: newProvince,
        district: '',
        ward: '',
      });
    }
  };

  const handleDistrictChange = (e) => {
    const newDistrict = e.target.value;
    if (onChange) {
      onChange({
        province,
        district: newDistrict,
        ward: '',
      });
    }
  };

  const handleWardChange = (e) => {
    const newWard = e.target.value;
    if (onChange) {
      onChange({
        province,
        district,
        ward: newWard,
      });
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {/* Province Select */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Tỉnh / Thành phố {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <select
            name="province"
            value={province}
            onChange={handleProvinceChange}
            disabled={disabled}
            className={`w-full appearance-none rounded-2xl border px-3.5 py-3 pr-9 text-xs font-medium transition-all duration-200 outline-none cursor-pointer bg-neutral-50 dark:bg-neutral-900 ${
              errors.province
                ? 'border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                : 'border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-950'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="" disabled className="text-neutral-400">
              -- Chọn Tỉnh / Thành phố --
            </option>
            {provinceOptions.map((pName) => (
              <option key={pName} value={pName} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                {pName}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-base flex items-center">
            <Icon icon="solar:alt-arrow-down-linear" />
          </div>
        </div>
        {errors.province && (
          <p className="text-[11px] font-medium text-rose-500 animate-fade-in">{errors.province}</p>
        )}
      </div>

      {/* District Select */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Quận / Huyện {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <select
            name="district"
            value={district}
            onChange={handleDistrictChange}
            disabled={disabled || !province || districtOptions.length === 0}
            className={`w-full appearance-none rounded-2xl border px-3.5 py-3 pr-9 text-xs font-medium transition-all duration-200 outline-none cursor-pointer bg-neutral-50 dark:bg-neutral-900 ${
              errors.district
                ? 'border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                : 'border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-950'
            } ${disabled || !province || districtOptions.length === 0 ? 'opacity-50 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-900/40' : ''}`}
          >
            <option value="" disabled className="text-neutral-400">
              {province ? '-- Chọn Quận / Huyện --' : '-- Chọn Tỉnh/Thành trước --'}
            </option>
            {districtOptions.map((dName) => (
              <option key={dName} value={dName} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                {dName}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-base flex items-center">
            <Icon icon="solar:alt-arrow-down-linear" />
          </div>
        </div>
        {errors.district && (
          <p className="text-[11px] font-medium text-rose-500 animate-fade-in">{errors.district}</p>
        )}
      </div>

      {/* Ward Select */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Phường / Xã {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <select
            name="ward"
            value={ward}
            onChange={handleWardChange}
            disabled={disabled || !district || wardOptions.length === 0}
            className={`w-full appearance-none rounded-2xl border px-3.5 py-3 pr-9 text-xs font-medium transition-all duration-200 outline-none cursor-pointer bg-neutral-50 dark:bg-neutral-900 ${
              errors.ward
                ? 'border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
                : 'border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-950'
            } ${disabled || !district || wardOptions.length === 0 ? 'opacity-50 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-900/40' : ''}`}
          >
            <option value="" disabled className="text-neutral-400">
              {district ? '-- Chọn Phường / Xã --' : '-- Chọn Quận/Huyện trước --'}
            </option>
            {wardOptions.map((wName) => (
              <option key={wName} value={wName} className="bg-white dark:bg-neutral-900 text-black dark:text-white">
                {wName}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-base flex items-center">
            <Icon icon="solar:alt-arrow-down-linear" />
          </div>
        </div>
        {errors.ward && (
          <p className="text-[11px] font-medium text-rose-500 animate-fade-in">{errors.ward}</p>
        )}
      </div>
    </div>
  );
}
