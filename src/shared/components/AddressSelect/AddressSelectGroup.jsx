import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../Icon';
import {
  findProvinceObject,
  getVietnamAddressMetadata,
  loadVietnamAddressTree,
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
  const [addressError, setAddressError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setAddressError(null);
    loadVietnamAddressTree()
      .then((tree) => {
        if (isMounted) setAddressTree(tree);
      })
      .catch((error) => {
        if (isMounted) setAddressError(error);
      });
    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  const currentProvince = useMemo(
    () => findProvinceObject(addressTree, province),
    [addressTree, province],
  );
  const provinceOptions = useMemo(() => addressTree.map((item) => item.name), [addressTree]);
  const communeOptions = useMemo(
    () => currentProvince?.communes?.map((item) => item.name) || [],
    [currentProvince],
  );

  const selectClass = (error, isDisabled) => `w-full appearance-none rounded-2xl border px-3.5 py-3 pr-9 text-xs font-medium transition-all duration-200 outline-none cursor-pointer bg-neutral-50 dark:bg-neutral-900 ${
    error
      ? 'border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20'
      : 'border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-neutral-300 dark:hover:border-neutral-700 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-950'
  } ${isDisabled ? 'opacity-50 cursor-not-allowed bg-neutral-100/60 dark:bg-neutral-900/40' : ''}`;

  if (addressError) {
    return (
      <div className={`rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-700 ${className}`}>
        <p>Không thể tải danh sách địa chỉ hành chính.</p>
        <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="mt-2 underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      <div className="space-y-1.5">
        <label className="block text-[11px] font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
          Tỉnh / Thành phố {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <select
            name="province"
            value={province}
            onChange={(event) => {
              const selected = findProvinceObject(addressTree, event.target.value);
              onChange?.({
                province: event.target.value,
                district: '',
                ward: '',
                provinceCode: selected?.code || null,
                communeCode: null,
                administrativeDatasetId: getVietnamAddressMetadata()?.datasetId || null,
              });
            }}
            disabled={disabled}
            className={selectClass(errors.province, disabled)}
          >
            <option value="" disabled>Chọn Tỉnh / Thành phố</option>
            {provinceOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-base flex items-center">
            <Icon icon="solar:alt-arrow-down-linear" />
          </div>
        </div>
        {errors.province && <p className="text-[11px] font-medium text-rose-500">{errors.province}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="block text-[11px] font-[550] uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
          Phường / Xã {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <select
            name="ward"
            value={ward}
            onChange={(event) => {
              const selected = findCommuneObject(currentProvince, event.target.value);
              onChange?.({
                province,
                district: '',
                ward: event.target.value,
                provinceCode: currentProvince?.code || null,
                communeCode: selected?.code || null,
                administrativeDatasetId: getVietnamAddressMetadata()?.datasetId || null,
              });
            }}
            disabled={disabled || !province || communeOptions.length === 0}
            className={selectClass(errors.ward, disabled || !province || communeOptions.length === 0)}
          >
            <option value="" disabled>
              {province ? 'Chọn Phường / Xã' : 'Chọn Tỉnh / Thành trước'}
            </option>
            {communeOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-base flex items-center">
            <Icon icon="solar:alt-arrow-down-linear" />
          </div>
        </div>
        {errors.ward && <p className="text-[11px] font-medium text-rose-500">{errors.ward}</p>}
      </div>

    </div>
  );
}
