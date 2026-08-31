import React from 'react';
import { useTranslation } from "react-i18next";
import Icon from './Icon';
import PrimaryButton from './Button/PrimaryButton';
import { cn } from '../utils/cn';

export default function EmptyState({
  title,
  description,
  icon = 'solar:box-minimalistic-line-duotone',
  actionLabel = '',
  onAction = null,
  className = '',
}) {
  const { t } = useTranslation();
  const resolvedTitle = title || t("common.khongCoDuLieu", "Không có dữ liệu");
  const resolvedDescription = description || t("common.khongTimThayKetQuaPhuHop", "Không tìm thấy kết quả hoặc nội dung phù hợp.");

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm min-h-[260px]",
      className
    )}>
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        <Icon icon={icon} className="text-3xl" />
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1.5">
        {resolvedTitle}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {resolvedDescription}
      </p>

      {actionLabel && onAction && (
        <PrimaryButton onClick={onAction} size="sm">
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}