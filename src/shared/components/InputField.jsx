import { useState } from 'react';
import Icon from './Icon';
import { cn } from '../utils/cn';

/**
 * Reusable InputField in Pure Monochrome (Black & White)
 */
export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  icon,
  rightIcon,
  onRightIconClick,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  helperText,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={cn("w-full mb-4", className)}>
      {label && (
        <label 
          htmlFor={name}
          className="block text-xs font-black uppercase tracking-wider text-black dark:text-white mb-1.5"
        >
          {label}
          {required && <span className="text-black dark:text-white ml-1">*</span>}
        </label>
      )}

      <div 
        className={cn(
          "relative flex items-center w-full rounded-xl border bg-white dark:bg-neutral-900 transition-all duration-150 shadow-sm",
          error 
            ? "border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/20" 
            : isFocused 
              ? "border-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/10" 
              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700",
          disabled && "opacity-50 bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed"
        )}
      >
        {icon && (
          <div className="pl-3.5 pr-1 flex items-center pointer-events-none text-neutral-400">
            <Icon icon={icon} className="text-lg" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          className={cn(
            "w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm font-medium text-black dark:text-white placeholder:text-neutral-400 outline-none border-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed",
            inputClassName
          )}
          {...props}
        />

        {rightIcon && (
          <div 
            onClick={onRightIconClick}
            className={cn(
              "pr-3.5 pl-1 flex items-center text-neutral-400 transition-colors",
              onRightIconClick && "cursor-pointer hover:text-black dark:hover:text-white"
            )}
          >
            <Icon icon={rightIcon} className="text-lg" />
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-1.5 text-rose-500 text-xs mt-1.5 font-bold animate-fade-in">
          <Icon icon="solar:danger-circle-bold" className="text-sm flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p className="text-neutral-500 text-xs mt-1.5 font-medium">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
