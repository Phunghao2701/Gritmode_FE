import React from 'react';
import Icon from './Icon';
import PrimaryButton from './Button/PrimaryButton';
import { cn } from '../utils/cn';

export default function ErrorState({
  title,
  message,
  icon = 'solar:danger-triangle-bold',
  onRetry = null,
  retryLabel,
  className = '',
}) {
  const resolvedTitle = title || 'Không thể tải dữ liệu';
  const resolvedMessage = message || 'Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau.';
  const resolvedRetryLabel = retryLabel || 'Thử lại';

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-sm min-h-[260px]",
      className
    )}>
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-500 mb-4">
        <Icon icon={icon} className="text-3xl" />
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {resolvedTitle}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {resolvedMessage}
      </p>

      {onRetry && (
        <PrimaryButton 
          variant="outline" 
          onClick={onRetry} 
          icon="solar:restart-bold" 
          size="sm"
        >
          {resolvedRetryLabel}
        </PrimaryButton>
      )}
    </div>
  );
}