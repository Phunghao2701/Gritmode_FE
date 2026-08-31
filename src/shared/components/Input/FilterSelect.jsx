import React from 'react';
import { cn } from '../../utils/cn';

/**
 * FilterSelect Component styled with Tailwind CSS
 */
export default function FilterSelect({ 
  value, 
  onChange, 
  options = [], 
  disabled = false, 
  className = '', 
  ...props 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
        className
      )}
      {...props}
    >
      {options.map((opt, idx) => (
        <option 
          key={opt.value ?? idx} 
          value={opt.value} 
          title={opt.title || opt.label}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
}
