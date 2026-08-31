import React from 'react';
import PaginationControls from './PaginationControls';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils/cn';

/**
 * Reusable Pagination Component for lists
 */
export default function Pagination({
  totalItems = 0,
  currentPage = 1,
  limit = 10,
  onPageChange,
  entityName = 'sản phẩm',
  className = '',
}) {
  const { t, i18n } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(totalItems, currentPage * limit);

  if (totalItems === 0) {
    return null;
  }

  const isEn = i18n.language === 'en';
  const formatNum = (num) => num.toLocaleString(isEn ? 'en-US' : 'vi-VN');

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2", className)}>
      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {t('pagination.showing', 'Hiển thị')}{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNum(startItem)}</span>{' '}
        -{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNum(endItem)}</span>{' '}
        {t('pagination.of', 'trong số')}{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-200">{formatNum(totalItems)}</span>{' '}
        {entityName}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
