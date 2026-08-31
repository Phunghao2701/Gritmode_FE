import React from 'react';
import Icon from '../Icon';
import { cn } from '../../utils/cn';

/**
 * Reusable Button component styled in Pure Monochrome (Black & White)
 */
export default function PrimaryButton({
  children,
  icon = '',
  iconPosition = 'left',
  className = '',
  type = 'button',
  variant = 'primary', // 'primary' | 'outline' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-wider rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-2 gap-1.5",
    md: "text-xs sm:text-sm px-5 py-2.5 gap-2",
    lg: "text-sm sm:text-base px-7 py-3.5 gap-2.5",
  };

  const variantStyles = {
    primary: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-md",
    secondary: "bg-neutral-100 text-black hover:bg-neutral-200 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800",
    outline: "border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white",
    ghost: "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900 text-black dark:text-white",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        baseStyles,
        sizeStyles[size] || sizeStyles.md,
        variantStyles[variant] || variantStyles.primary,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Icon icon="solar:spinner-line-duotone" className="animate-spin text-lg" />
      ) : (
        icon && iconPosition === 'left' && <Icon icon={icon} className="text-base" />
      )}
      
      {children}

      {!isLoading && icon && iconPosition === 'right' && (
        <Icon icon={icon} className="text-base" />
      )}
    </button>
  );
}
