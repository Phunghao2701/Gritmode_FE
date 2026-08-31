import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { cn } from '../../utils/cn';

/**
 * FilterSearch Component with Tailwind CSS & Debounce
 */
export default function FilterSearch({
  value,
  onChange,
  initialValue,
  onSearchChange,
  placeholder,
  className = '',
  actionButton = null,
}) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t("common.timKiem", "Tìm kiếm...");
  const isControlled = value !== undefined;
  const [internalVal, setInternalVal] = useState(initialValue || '');

  useEffect(() => {
    if (!isControlled && initialValue !== undefined) {
      setInternalVal(initialValue);
    }
  }, [initialValue, isControlled]);

  const onSearchChangeRef = useRef(onSearchChange);
  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    if (isControlled) return;
    const timer = setTimeout(() => {
      onSearchChangeRef.current && onSearchChangeRef.current(internalVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [internalVal, isControlled]);

  const handleChange = (e) => {
    if (isControlled) {
      onChange && onChange(e);
    } else {
      setInternalVal(e.target.value);
    }
  };

  const handleClear = () => {
    if (isControlled) {
      onChange && onChange({ target: { value: '' } });
    } else {
      setInternalVal('');
    }
  };

  const displayValue = isControlled ? value : internalVal;

  return (
    <div className={cn(
      "relative flex items-center w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/15 transition-all",
      className
    )}>
      <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Icon icon="solar:magnifer-linear" className="text-lg" />
      </div>

      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={resolvedPlaceholder}
        className="w-full bg-transparent py-2.5 pr-8 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
      />

      {displayValue && (
        <button
          type="button"
          onClick={handleClear}
          title={t("common.xoaTimKiem", "Xóa tìm kiếm")}
          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <Icon icon="solar:close-circle-bold" className="text-base" />
        </button>
      )}

      {actionButton && (
        <div className="pr-2">
          {actionButton}
        </div>
      )}
    </div>
  );
}